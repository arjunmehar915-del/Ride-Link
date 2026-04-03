package com.Ridelink.RideLink.Service;

public interface EmailService {
    void sendSimpleEmail(String to, String subject, String body);
}