package com.Ridelink.RideLink.Service;

import com.Ridelink.RideLink.Entity.Ride;
import java.time.LocalDateTime;
import java.util.List;

public interface RideService {
    Ride createRide(Ride ride, Long driverId);
    List<Ride> searchRides(String source, String destination, LocalDateTime departureTime);
    Ride getRideById(Long id);
}