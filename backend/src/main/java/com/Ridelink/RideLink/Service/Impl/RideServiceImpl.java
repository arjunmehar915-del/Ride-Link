package com.Ridelink.RideLink.Service.Impl;

import com.Ridelink.RideLink.Entity.Ride;
import com.Ridelink.RideLink.Entity.RideStatus;
import com.Ridelink.RideLink.Entity.User;
import com.Ridelink.RideLink.Exception.ResourceNotFoundException;
import com.Ridelink.RideLink.Repository.RideRepository;
import com.Ridelink.RideLink.Repository.UserRepository;
import com.Ridelink.RideLink.Service.RideService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RideServiceImpl implements RideService {

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Ride createRide(Ride ride, Long driverId) {
        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + driverId));

        ride.setDriver(driver);
        ride.setStatus(RideStatus.OPEN);
        ride.setAvailableSeats(ride.getTotalSeats());
        return rideRepository.save(ride);
    }

    @Override
    public List<Ride> searchRides(String source, String destination, LocalDateTime departureTime) {
        // 1. Jis din ki ride search ho rahi hai, us din ki shuruat (00:00:00)
        LocalDateTime searchDateStart = departureTime.toLocalDate().atStartOfDay();

        // 2. Us din ka khatma (23:59:59)
        LocalDateTime searchDateEnd = departureTime.toLocalDate().atTime(23, 59, 59);

        // 3. Abhi ka waqt (taaki purani rides filter ho sakein)
        LocalDateTime currentTime = LocalDateTime.now();

        // Repository ko saare parameters bhejien jo humne Repository Interface mein likhe hain
        return rideRepository.findAvailableRides(
                source,
                destination,
                searchDateStart,
                searchDateEnd,
                currentTime
        );
    }

    @Override
    public Ride getRideById(Long id) {
        return rideRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + id));
    }

    @Override
    public List<Ride> getRidesByDriverId(Long driverId) {
        return rideRepository.findByDriverId(driverId);
    }
}