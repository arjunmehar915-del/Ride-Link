package com.Ridelink.RideLink.Service.Impl;

import com.Ridelink.RideLink.Entity.Booking;
import com.Ridelink.RideLink.Entity.BookingStatus;
import com.Ridelink.RideLink.Entity.Ride;
import com.Ridelink.RideLink.Entity.RideStatus;
import com.Ridelink.RideLink.Entity.User;
import com.Ridelink.RideLink.Exception.BadRequestException;
import com.Ridelink.RideLink.Exception.ResourceNotFoundException;
import com.Ridelink.RideLink.Repository.BookingRepository;
import com.Ridelink.RideLink.Repository.RideRepository;
import com.Ridelink.RideLink.Repository.UserRepository;
import com.Ridelink.RideLink.Service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID; // <-- Ye import zaroori hai Payment ID ke liye

@Service
public class BookingServiceImpl implements BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public Booking bookRide(Long rideId, Long passengerId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        User passenger = userRepository.findById(passengerId)
                .orElseThrow(() -> new ResourceNotFoundException("Passenger not found"));

        if (ride.getAvailableSeats() <= 0) {
            throw new BadRequestException("Ride is full!");
        }

        if (ride.getDriver().getId().equals(passengerId)) {
            throw new BadRequestException("Driver cannot book their own ride.");
        }

        Booking booking = new Booking();
        booking.setRide(ride);
        booking.setPassenger(passenger);
        booking.setBookingTime(LocalDateTime.now());
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setPaid(false); // Default payment status false rahega

        // OTP Generate Logic (4 Digit)
        String otp = String.format("%04d", new Random().nextInt(10000));
        booking.setRideOtp(otp);

        // Seat Minus Logic
        ride.setAvailableSeats(ride.getAvailableSeats() - 1);
        if (ride.getAvailableSeats() == 0) {
            ride.setStatus(RideStatus.FULL);
        }
        rideRepository.save(ride);

        return bookingRepository.save(booking);
    }

    @Override
    public Booking verifyRideOtp(Long rideId, String otp) {
        Booking booking = bookingRepository.findByRideIdAndRideOtp(rideId, otp)
                .orElseThrow(() -> new BadRequestException("Invalid OTP or Booking not found"));

        booking.setStatus(BookingStatus.COMPLETED);
        return bookingRepository.save(booking);
    }

    // --- NEW METHOD: FAKE PAYMENT LOGIC ---
    @Override
    public Booking processPayment(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        if (booking.isPaid()) {
            throw new BadRequestException("Booking is already paid!");
        }

        // Fake Payment Process
        booking.setPaid(true);
        // Ek unique fake transaction ID generate kar rahe hain
        booking.setPaymentId("PAY_DEMO_" + UUID.randomUUID().toString());

        return bookingRepository.save(booking);
    }
}