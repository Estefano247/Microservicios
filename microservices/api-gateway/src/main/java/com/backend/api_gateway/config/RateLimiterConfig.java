package com.backend.api_gateway.config;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RateLimiter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import reactor.core.publisher.Mono;

@Configuration
public class RateLimiterConfig {

    @Bean
    public KeyResolver principalNameKeyResolver() {
        return exchange -> {
            String userId = exchange.getRequest().getHeaders().getFirst("X-User-Id");
            if (userId != null && !userId.equals("unknown")) {
                return Mono.just(userId);
            }
            String ip = exchange.getRequest().getRemoteAddress() != null
                ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
                : "unknown";
            return Mono.just(ip);
        };
    }

    @Bean
    @Primary
    public RateLimiter<?> defaultRateLimiter() {
        return new InMemoryRateLimiter();
    }

    static class InMemoryRateLimiter implements RateLimiter<InMemoryRateLimiter.Config> {

        private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
        private Config config = new Config();

        @Override
        public Mono<Response> isAllowed(String routeId, String id) {
            long now = System.currentTimeMillis();
            Bucket bucket = buckets.computeIfAbsent(id, k -> new Bucket());
            synchronized (bucket) {
                bucket.trim(now, config.windowSizeMs);
                boolean allowed = bucket.count < config.maxRequests;
                if (allowed) {
                    bucket.add(now);
                }
                int remaining = Math.max(0, config.maxRequests - bucket.count);
                return Mono.just(new Response(allowed, Map.of(
                    "remaining", String.valueOf(remaining),
                    "limit", String.valueOf(config.maxRequests)
                )));
            }
        }

        @Override
        public Map<String, Config> getConfig() {
            return Map.of("default", config);
        }

        @Override
        public Class<Config> getConfigClass() {
            return Config.class;
        }

        @Override
        public Config newConfig() {
            return new Config();
        }

        public static class Config {
            int maxRequests = 100;
            long windowSizeMs = Duration.ofMinutes(1).toMillis();
        }

        static class Bucket {
            final java.util.LinkedList<Long> timestamps = new java.util.LinkedList<>();
            int count;

            void add(long now) {
                timestamps.addLast(now);
                count++;
            }

            void trim(long now, long windowMs) {
                while (!timestamps.isEmpty() && now - timestamps.getFirst() > windowMs) {
                    timestamps.removeFirst();
                    count--;
                }
            }
        }
    }
}