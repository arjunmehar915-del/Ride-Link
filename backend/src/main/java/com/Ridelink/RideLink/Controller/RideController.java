package com.Ridelink.RideLink.Controller;

import com.Ridelink.RideLink.DTO.MessageResponse;
import com.Ridelink.RideLink.DTO.RideRequestDto;
import com.Ridelink.RideLink.Entity.Ride;
import com.Ridelink.RideLink.Service.RideService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/rides")
@CrossOrigin(origins = "*")
public class RideController {

    @Autowired
    private RideService rideService;

    // Create Ride (Only Drivers)
    @PostMapping("/create")
    public ResponseEntity<?> createRide(@RequestBody RideRequestDto rideRequest,
                                        @RequestParam Long driverId) {
        Ride ride = Ride.builder()
                .sourceName(rideRequest.getSourceName())
                .sourceLatitude(rideRequest.getSourceLatitude())
                .sourceLongitude(rideRequest.getSourceLongitude())
                .destinationName(rideRequest.getDestinationName())
                .destinationLatitude(rideRequest.getDestinationLatitude())
                .destinationLongitude(rideRequest.getDestinationLongitude())
                .departureTime(rideRequest.getDepartureTime())
                .pricePerSeat(rideRequest.getPricePerSeat())
                .totalSeats(rideRequest.getTotalSeats())
                .build();

        Ride createdRide = rideService.createRide(ride, driverId);
        return ResponseEntity.ok(createdRide);
    }

    // Search Rides (Public)
    @GetMapping("/search")
    public ResponseEntity<List<Ride>> searchRides(
            @RequestParam String source,
            @RequestParam String destination,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date) {

        List<Ride> rides = rideService.searchRides(source, destination, date);
        return ResponseEntity.ok(rides);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ride> getRide(@PathVariable Long id) {
        return ResponseEntity.ok(rideService.getRideById(id));
    }
}