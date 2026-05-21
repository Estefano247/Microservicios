"""
Analytics Dashboard - Microservicios E-commerce
Proporciona visualización de datos consolidados de múltiples microservicios
"""
import os
import logging
import streamlit as st
import pandas as pd
import plotly.express as px
from sqlalchemy import create_engine, pool
from sqlalchemy.exc import SQLAlchemyError
import py_eureka_client.eureka_client as eureka_client

# ✅ MEJORA: Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ✅ MEJORA: Usar variables de entorno
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'password')
DB_HOST = os.getenv('DB_HOST', 'postgres')
DB_PORT = os.getenv('DB_PORT', '5432')

EUREKA_SERVER = os.getenv('EUREKA_SERVER', 'http://discovery-server:8761/eureka')
EUREKA_PORT = os.getenv('EUREKA_PORT', '8501')

# ✅ MEJORA: Registrar en Eureka con mejor manejo de errores
try:
    eureka_client.init(
        eureka_server=EUREKA_SERVER,
        app_name="analytics-dashboard",
        instance_port=int(EUREKA_PORT),
        renewal_interval_in_secs=30,
        duration_in_secs=90
    )
    logger.info("✓ Registrado exitosamente en Eureka")
except Exception as e:
    logger.warning(f"⚠ No se pudo registrar en Eureka: {e}")

# ✅ MEJORA: Crear conexiones con pooling de conexiones
def create_db_engine(database_name):
    """Crear conexión a base de datos con pooling"""
    try:
        connection_string = f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{database_name}'
        engine = create_engine(
            connection_string,
            poolclass=pool.QueuePool,
            pool_size=5,
            max_overflow=10,
            echo=False
        )
        logger.info(f"✓ Conexión a {database_name} establecida")
        return engine
    except Exception as e:
        logger.error(f"✗ Error conectando a {database_name}: {e}")
        return None

try:
    engine_users = create_db_engine('user_db')
    engine_products = create_db_engine('product_db')
    engine_inventory = create_db_engine('inventory_db')
except Exception as e:
    logger.error(f"✗ Error inicializando conexiones: {e}")
    st.error("No se pudo conectar a las bases de datos")
    st.stop()

st.set_page_config(page_title="E-Commerce Analytics", layout="wide")
st.title("📚 Dashboard Consolidado de Librería")

@st.cache_data(ttl=60) 
def get_data():
    """Obtener datos de todas las bases de datos"""
    try:
        if engine_users is None or engine_products is None or engine_inventory is None:
            logger.error("Conexiones no disponibles")
            return None, None, None
            
        users = pd.read_sql("SELECT role, enabled FROM users_tb", engine_users)
        
        query_products = """
            SELECT p.titulo, p.categoria, p.tipo, p.precio, a.nombre as autor, a.pais_origen 
            FROM products_tb p 
            LEFT JOIN authors_tb a ON p.author_id = a.id
        """
        products = pd.read_sql(query_products, engine_products)
        
        inventory = pd.read_sql("SELECT cantidad, min_stock, producto_id FROM inventory_tb", engine_inventory)
        
        logger.info(f"✓ Datos cargados: {len(users)} usuarios, {len(products)} productos, {len(inventory)} inventarios")
        return users, products, inventory
    except SQLAlchemyError as e:
        logger.error(f"✗ Error en base de datos: {e}")
        return None, None, None
    except Exception as e:
        logger.error(f"✗ Error inesperado al obtener datos: {e}")
        return None, None, None

try:
    df_users, df_products, df_inv = get_data()
    
    if df_users is None:
        st.error("Error: No se pudieron cargar los datos del dashboard")
        st.stop()

    # ✅ MEJORA: Métricas con mejor manejo de datos vacíos
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        total_users = len(df_users) if df_users is not None else 0
        st.metric("Total Usuarios", total_users)
    with col2:
        total_books = len(df_products) if df_products is not None else 0
        st.metric("Catálogo de Libros", total_books)
    with col3:
        if df_inv is not None and not df_inv.empty:
            bajo_stock = len(df_inv[df_inv['cantidad'] <= df_inv['min_stock']])
            st.metric("Alertas de Stock", bajo_stock, delta_color="inverse", delta=f"{bajo_stock} críticos")
        else:
            st.metric("Alertas de Stock", 0)
    with col4:
        promedio_precio = df_products['precio'].mean() if (df_products is not None and not df_products.empty) else 0
        st.metric("Precio Promedio", f"${promedio_precio:.2f}")

    st.divider()

    left_column, right_column = st.columns(2)

    with left_column:
        st.subheader("👥 Distribución de Usuarios por Rol")
        if df_users is not None and not df_users.empty and 'role' in df_users.columns:
            fig_roles = px.pie(df_users, names='role', hole=0.4, 
                              color_discrete_sequence=px.colors.sequential.RdBu)
            st.plotly_chart(fig_roles, use_container_width=True)
        else:
            st.info("No hay datos de usuarios disponibles")

    with right_column:
        st.subheader("📖 Libros por Categoría")
        if df_products is not None and not df_products.empty and 'categoria' in df_products.columns:
            fig_cat = px.bar(df_products['categoria'].value_counts().reset_index(), 
                            x='categoria', y='count', labels={'count': 'Cantidad', 'categoria': 'Género'},
                            color='categoria')
            st.plotly_chart(fig_cat, use_container_width=True)
        else:
            st.info("No hay productos registrados.")

    st.divider()
    st.subheader("🌍 Origen de Autores y Diversidad")
    
    c1, c2 = st.columns([2, 1])
    with c1:
        if df_products is not None and 'pais_origen' in df_products.columns:
            fig_map = px.histogram(df_products, x="pais_origen", color="tipo", barmode="group",
                                  title="Libros por País del Autor y Formato")
            st.plotly_chart(fig_map, use_container_width=True)
            
    with c2:
        st.subheader("📦 Estado de Almacén")
        if df_inv is not None and not df_inv.empty:
            st.dataframe(df_inv.sort_values('cantidad').head(5), hide_index=True)
        else:
            st.info("No hay datos de inventario")

    logger.info("✓ Dashboard renderizado exitosamente")

except SQLAlchemyError as db_error:
    logger.error(f"✗ Error de base de datos: {db_error}")
    st.error(f"Error de conexión a base de datos: {db_error}")
    st.info("Verifica que PostgreSQL esté corriendo y las tablas existan")
except Exception as e:
    logger.error(f"✗ Error inesperado: {e}")
    st.error(f"Error cargando el dashboard: {e}")
    st.info("Asegúrate de que las tablas existan y tengan datos.")