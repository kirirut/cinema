package org.example.cinema.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({JwtProperties.class, RateLimitProperties.class, CorsProperties.class})
public class AppConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager(
                "movies", "movie", "genres", "genre", "countries", "country", "tags", "tag"
        );
        manager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(500)
                .recordStats());
        return manager;
    }
}
