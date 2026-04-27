package com.Ridelink.RideLink.Service;

import com.Ridelink.RideLink.Entity.Booking;

import java.util.List;

public interface BookingService {
    Booking bookRide(Long rideId, Long passengerId, Integer seatsBooked);
    Booking verifyRideOtp(Long rideId, String otp);
    Booking processPayment(Long bookingId);


    List<Booking> getBookingsByPassangerId(Long passengerId);

    List<Booking> getBookingsByRideId(Long rideId);
}