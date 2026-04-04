package com.Ridelink.RideLink.Repository;

import com.Ridelink.RideLink.Entity.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {

    @Query("SELECT r FROM Ride r WHERE r.sourceName = :source " +
            "AND r.destinationName = :destination " +
            "AND r.departureTime > :currentTime " +
            "AND r.status = 'OPEN' " +
            "AND r.availableSeats > 0")
    List<Ride> findAvailableRides(
            @Param("source") String source,
            @Param("destination") String destination,
            @Param("currentTime") LocalDateTime currentTime
    );

    List<Ride> findByDriverId(Long driverId);
}