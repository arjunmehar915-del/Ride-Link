package com.Ridelink.RideLink.Controller;

import com.Ridelink.RideLink.Entity.Booking;
import com.Ridelink.RideLink.Service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // 1. Ride Book Karna
    @PostMapping("/book")
    public ResponseEntity<Booking> bookRide(@RequestParam Long rideId,
                                            @RequestParam Long passengerId,
                                            @RequestParam Integer seatsBooked) {
        Booking booking = bookingService.bookRide(rideId, passengerId, seatsBooked);
        return ResponseEntity.ok(booking);
    }

    // 2. OTP Verify Karna
    @PostMapping("/verify-otp")
    public ResponseEntity<Booking> verifyOtp(@RequestParam Long rideId,
                                             @RequestParam String otp) {
        Booking booking = bookingService.verifyRideOtp(rideId, otp);
        return ResponseEntity.ok(booking);
    }

    // 3. NEW: Fake Payment Process Karna (Added this endpoint)
    @PostMapping("/{bookingId}/pay")
    public ResponseEntity<Booking> payForBooking(@PathVariable Long bookingId) {
        Booking updatedBooking = bookingService.processPayment(bookingId);
        return ResponseEntity.ok(updatedBooking);
    }

    @GetMapping("/user/{passengerId}")
    public ResponseEntity<List<Booking>> getBookingsByPassenger(@PathVariable Long passengerId) {
        List<Booking> bookings = bookingService.getBookingsByPassangerId(passengerId);
        return ResponseEntity.ok(bookings);
    }


    @GetMapping("/ride/{rideId}")
    public ResponseEntity<List<Booking>> getBookingsByRideId(@PathVariable Long rideId) {
        return ResponseEntity.ok(bookingService.getBookingsByRideId(rideId));
    }
}