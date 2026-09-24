package ro.mpp2026.backend.util;

import lombok.experimental.UtilityClass;
import org.springframework.web.multipart.MultipartFile;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@UtilityClass
public class FileUploadUtil {
    public static final long MAX_FILE_SIZE = 2 * 1024 * 1024;

    public static final String IMAGE_PATTERN = "^.+(\\.(?i)(jpg|jpeg|png|gif|bmp|webp))$";
    public static final String DATE_FORMAT = "yyyyMMddHHmmss";

    public static final String FILE_NAME_FORMAT = "%s_%s_%s";

    public static boolean isAllowedExtension(final String fileName, final String pattern) {
        if (fileName == null) return false;
        final Matcher matcher = Pattern.compile(pattern, Pattern.CASE_INSENSITIVE).matcher(fileName);
        return matcher.matches();
    }

    public static void assertAllowed(MultipartFile file, String pattern) {
        final long size = file.getSize();
        if (size > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Max file size is 2MB");
        }

        final String fileName = file.getOriginalFilename();
        if (!isAllowedExtension(fileName, pattern)) {
            throw new IllegalArgumentException("Only jpg, jpeg, png, gif, bmp, and webp files are allowed");
        }
    }

    public static String getFileName(final String name) {
        final DateFormat dateFormat = new SimpleDateFormat(DATE_FORMAT);
        final String date = dateFormat.format(System.currentTimeMillis());
        final String random = UUID.randomUUID().toString().substring(0, 6);
        return String.format(FILE_NAME_FORMAT, name, date, random);
    }
}