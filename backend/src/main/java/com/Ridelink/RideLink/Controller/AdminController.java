package com.Ridelink.RideLink.Controller;

import com.Ridelink.RideLink.Entity.User;
import com.Ridelink.RideLink.Repository.UserRepository;
import com.Ridelink.RideLink.Response.MessageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/pending-drivers")
    public ResponseEntity<?> getPendingDrivers() {
        try {
            // Step 1: Fetch directly from DB
            List<User> users = userRepository.findAll();

            // Step 2: Create a manual list of Maps (Zero chance of Circular Dependency)
            List<Map<String, Object>> result = new ArrayList<>();

            for (User u : users) {
                // Hamari DB table ke hisaab se filter
                if (u.getRole() != null && u.getRole().contains("DRIVER") && "PENDING".equals(u.getKycStatus())) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", u.getId());
                    map.put("fullName", u.getFullName());
                    map.put("email", u.getEmail());
                    map.put("licenseUrl", u.getLicenseUrl());
                    map.put("rcUrl", u.getRcUrl());
                    result.add(map);
                }
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace(); // Console mein error dekho!
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/verify-driver/{userId}")
    public ResponseEntity<?> verifyDriver(@PathVariable Long userId, @RequestParam String status) {
        try {
            return userRepository.findById(userId)
                    .map(user -> {
                        if (user.getRole() == null || !user.getRole().toUpperCase().contains("DRIVER")) {
                            return ResponseEntity.badRequest()
                                    .body(new MessageResponse("Error: User is not a Driver."));
                        }

                        user.setKycStatus(status.toUpperCase());
                        userRepository.save(user);

                        String message = status.equalsIgnoreCase("APPROVED")
                                ? "Driver verified successfully!"
                                : "Driver verification rejected.";

                        return ResponseEntity.ok(new MessageResponse(message));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new MessageResponse("Backend Error: " + e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        try {
            long totalUsers = userRepository.count();
            long pendingKyc = userRepository.findAll().stream()
                    .filter(u -> u.getKycStatus() != null && "PENDING".equalsIgnoreCase(u.getKycStatus()))
                    .count();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("pendingKyc", pendingKyc);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error fetching stats");
        }
    }
}