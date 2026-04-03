package com.Ridelink.RideLink.DTO;
import lombok.Data;

@Data
public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private String phone;
    private String role; // "DRIVER" or "PASSENGER"
}