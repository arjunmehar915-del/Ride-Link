package com.Ridelink.RideLink.Service.Impl;

import com.Ridelink.RideLink.Service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void sendSimpleEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("tumhara.email@gmail.com"); // Wahi email jo properties me hai
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            System.out.println("Mail sent successfully to " + to);
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
        }
    }
}