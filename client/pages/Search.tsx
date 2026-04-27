import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Calendar as CalendarIcon, Users, IndianRupee, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Ride {
  id: number;
  sourceName: string;
  destinationName: string;
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
  driver: {
    fullName: string;
  };
}

export default function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState<number | null>(null);

  // --- Aaj ki date nikalne ke liye (Validation ke liye) ---
  const today = format(new Date(), "yyyy-MM-dd");

  const [selectedSeats, setSelectedSeats] = useState<Record<number, number>>({});

  const source = searchParams.get("from") || "";
  const destination = searchParams.get("to") || "";
  const date = searchParams.get("date") || today;

  const fetchRides = async () => {
    if (!source || !destination) return;

    // Safety Check: Agar URL mein galti se purani date ho
    if (date < today) {
      toast.error("Past dates are not available.");
      setRides([]);
      return;
    }

    try {
      setIsLoading(true);
      const formattedDate = `${date}T00:00:00`;
      const response = await fetch(
        `http://localhost:9090/api/rides/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${formattedDate}`
      );
      if (!response.ok) throw new Error("Failed to fetch rides");
      const data = await response.json();
      setRides(data);

      const initialSeats: Record<number, number> = {};
      data.forEach((r: Ride) => { initialSeats[r.id] = 1; });
      setSelectedSeats(initialSeats);
    } catch (error: any) {
      toast.error("Could not load rides.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [source, destination, date]);

  const updateSeatCount = (rideId: number, delta: number, max: number) => {
    setSelectedSeats(prev => {
      const current = prev[rideId] || 1;
      const next = current + delta;
      if (next < 1 || next > max) return prev;
      return { ...prev, [rideId]: next };
    });
  };

  const handleBooking = async (rideId: number) => {
    const authData = JSON.parse(localStorage.getItem("ridelink:auth") || "{}");
    const token = authData.token;
    const passengerId = authData.id;
    const seatsToBook = selectedSeats[rideId] || 1;

    if (!token) {
      toast.error("Please login to book a ride");
      navigate("/login");
      return;
    }

    try {
      setIsBooking(rideId);
      const response = await fetch(
        `http://localhost:9090/api/bookings/book?rideId=${rideId}&passengerId=${passengerId}&seatsBooked=${seatsToBook}`,
        {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Booking failed");
      }

      toast.success(`${seatsToBook} Seat(s) booked successfully!`);
      fetchRides();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsBooking(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const selectedDate = formData.get("date") as string;

    // Frontend validation: Purani date search karne se rokna
    if (selectedDate < today) {
      toast.error("Please select a current or future date.");
      return;
    }

    setSearchParams({
      from: formData.get("from") as string,
      to: formData.get("to") as string,
      date: selectedDate,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8 border-primary/20 shadow-lg">
        <CardContent className="pt-6">
          <form onSubmit={handleSearchSubmit} className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-primary" />
              <Input name="from" placeholder="From" defaultValue={source} className="pl-9" required />
            </div>
            <div className="relative">
              <Navigation className="absolute left-3 top-3 h-4 w-4 text-primary" />
              <Input name="to" placeholder="To" defaultValue={destination} className="pl-9" required />
            </div>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-primary" />
              {/* min={today} lagane se user calendar mein purani date select nahi kar payega */}
              <Input
                name="date"
                type="date"
                defaultValue={date}
                min={today}
                className="pl-9"
                required
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Searching..." : "Find Rides"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <h2 className="text-2xl font-bold">Available Rides</h2>

        {rides.length === 0 && !isLoading ? (
          <div className="text-center py-20 bg-muted/30 rounded-xl border-2 border-dashed">
            <p className="text-muted-foreground text-lg italic">No future rides found for this route.</p>
          </div>
        ) : (
          rides.map((ride) => (
            <Card key={ride.id} className="overflow-hidden hover:shadow-md transition-all border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1 flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20" />
                      <div className="w-0.5 h-12 bg-border" />
                      <div className="h-3 w-3 rounded-full border-2 border-primary" />
                    </div>
                    <div className="space-y-4">
                      <div><p className="text-xs font-bold text-muted-foreground uppercase">From</p><p className="text-lg font-semibold">{ride.sourceName}</p></div>
                      <div><p className="text-xs font-bold text-muted-foreground uppercase">To</p><p className="text-lg font-semibold">{ride.destinationName}</p></div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-4 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-8 min-w-[180px]">
                    <div className="text-right">
                      <div className="flex items-center justify-end text-3xl font-black text-primary">
                        <IndianRupee className="h-6 w-6" /> {ride.pricePerSeat}
                      </div>
                      <p className="text-sm text-muted-foreground">per seat</p>
                    </div>

                    <div className="w-full space-y-3">
                      {ride.availableSeats > 0 && (
                        <div className="flex items-center justify-between bg-muted/50 rounded-lg p-1 border">
                          <button
                            type="button"
                            onClick={() => updateSeatCount(ride.id, -1, ride.availableSeats)}
                            className="h-8 w-8 flex items-center justify-center rounded hover:bg-background transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <div className="flex flex-col items-center px-2">
                            <span className="text-sm font-bold">{selectedSeats[ride.id] || 1}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">Seats</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateSeatCount(ride.id, 1, ride.availableSeats)}
                            className="h-8 w-8 flex items-center justify-center rounded hover:bg-background transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      <div className="text-right text-xs font-medium text-orange-600 mb-1">
                        {ride.availableSeats} seats left
                      </div>

                      <Button
                        onClick={() => handleBooking(ride.id)}
                        disabled={isBooking === ride.id || ride.availableSeats === 0}
                        className="w-full"
                        variant={ride.availableSeats === 0 ? "secondary" : "default"}
                      >
                        {isBooking === ride.id ? "Booking..." : ride.availableSeats === 0 ? "Sold Out" : "Book Now"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t flex justify-between text-xs text-muted-foreground italic">
                  <span>Driver: {ride.driver.fullName}</span>
                  <span>{format(new Date(ride.departureTime), "PPP • p")}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}