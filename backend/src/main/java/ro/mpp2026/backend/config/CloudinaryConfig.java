package ro.mpp2026.backend.config;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {
    @Bean
    public Cloudinary cloudinary() {
        final Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "zmnwbtgj");
        config.put("api_key", "395169893286631");
        config.put("api_secret", "BWkIsXga-_lyI-ANTi6_RBsaSms");
        return new Cloudinary(config);
    }
}
