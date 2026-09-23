package ro.mpp2026.backend.service;

import com.cloudinary.Cloudinary;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ro.mpp2026.backend.dto.CloudinaryResponse;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    @Transactional
    public CloudinaryResponse uploadFile(MultipartFile file, String fileName) {
        try{
            final Map result = cloudinary.uploader().upload(file.getBytes(), Map.of("public_id", "nhndev/product/" + fileName));
            final String url = (String) result.get("secure_url");
            final String publicId = (String) result.get("public_id");
            return CloudinaryResponse.builder().publicId(publicId).url(url).build();
        }catch (Exception e) {
            e.printStackTrace();
            throw new IllegalArgumentException("Failed to upload file: " + e.getMessage());
        }
    }
}
