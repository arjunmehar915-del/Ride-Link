package com.Ridelink.RideLink.Service;

import com.Ridelink.RideLink.Entity.Booking;

public interface BookingService {
    Booking bookRide(Long rideId, Long passengerId);
    Booking verifyRideOtp(Long rideId, String otp);
    Booking processPayment(Long bookingId);
}