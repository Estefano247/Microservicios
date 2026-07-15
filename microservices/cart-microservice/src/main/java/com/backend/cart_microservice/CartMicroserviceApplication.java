package com.backend.cart_microservice;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.module.SimpleModule;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
@EnableFeignClients
public class CartMicroserviceApplication {

	@Autowired
	private ObjectMapper objectMapper;

	@PostConstruct
	public void overrideFeignSortSerializer() {
		SimpleModule module = new SimpleModule("SortSerializerFix");
		module.addSerializer(org.springframework.data.domain.Sort.class, new JsonSerializer<org.springframework.data.domain.Sort>() {
			@Override
			public void serialize(org.springframework.data.domain.Sort sort, JsonGenerator gen, SerializerProvider provider) throws IOException {
				if (sort == null) { gen.writeNull(); return; }
				gen.writeStartArray();
				for (org.springframework.data.domain.Sort.Order order : sort) {
					gen.writeStartObject();
					gen.writeStringField("property", order.getProperty());
					gen.writeStringField("direction", order.getDirection().name());
					gen.writeStringField("nullHandling", order.getNullHandling().name());
					gen.writeBooleanField("ascending", order.isAscending());
					gen.writeBooleanField("descending", order.isDescending());
					gen.writeBooleanField("ignoreCase", order.isIgnoreCase());
					gen.writeEndObject();
				}
				gen.writeEndArray();
			}
		});
		objectMapper.registerModule(module);
	}

	public static void main(String[] args) {
		SpringApplication.run(CartMicroserviceApplication.class, args);
	}

}
