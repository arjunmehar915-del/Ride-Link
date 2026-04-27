import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"; // NAYA IMPORT
import { Button } from "@/components/ui/button"; // NAYA IMPORT
import { Car, Ticket, Calendar, MapPin, IndianRupee, Users, Phone, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const maskPhone = (phone?: string) => {
  if (!phone) return "N/A";
  if (phone.length <= 3) return phone;
  return "*".repeat(phone.length - 3) + phone.slice(-3);
};

export default function Account() {
  const [myRides, setMyRides] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States for Popups
  const [selectedRide, setSelectedRide] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [ridePassengers, setRidePassengers] = useState<any[]>([]);
  const [isFetchingPassengers, setIsFetchingPassengers] = useState(false);

  // 🔥 NAYE STATES: OTP verification ke liye 🔥
  const [otpInputs, setOtpInputs] = useState<Record<number, string>>({});
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  const authData = JSON.parse(localStorage.getItem("ridelink:auth") || "{}");
  const userId = authData.id;
  const token = authData.token;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || !token) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const headers = { "Authorization": `Bearer ${token}` };

        const ridesRes = await fetch(`http://localhost:9090/api/rides/driver/${userId}`, { headers });
        setMyRides(await ridesRes.json());

        const bookingsRes = await fetch(`http://localhost:9090/api/bookings/user/${userId}`, { headers });
        setMyBookings(await bookingsRes.json());
      } catch (error) {
        toast.error("Failed to load account data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [userId, token]);

  const handleRideClick = async (ride: any) => {
    setSelectedRide(ride);
    setIsFetchingPassengers(true);
    setOtpInputs({}); // Reset old OTP inputs
    try {
      const response = await fetch(`http://localhost:9090/api/bookings/ride/${ride.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      setRidePassengers(data);
    } catch (error) {
      toast.error("Could not load passenger details");
    } finally {
      setIsFetchingPassengers(false);
    }
  };

  // 🔥 NAYA FUNCTION: Driver OTP verify karega 🔥
  const handleVerifyOtp = async (bookingId: number) => {
    const enteredOtp = otpInputs[bookingId];
    if (!enteredOtp || enteredOtp.length < 4) {
      toast.error("Please enter a valid 4-digit OTP");
      return;
    }

    try {
      setVerifyingId(bookingId);

      // YAHAN BACKEND API CALL AAYEGI (Example)
      /*
      const response = await fetch(`http://localhost:9090/api/bookings/verify-boarding?bookingId=${bookingId}&otp=${enteredOtp}`, {
        method: 'POST',
        headers: { "Authorization": `Bearer ${token}` }
      });
      if(!response.ok) throw new Error("Invalid OTP!");
      */

      // Abhi ke liye hum UI mein success dikha rahe hain
      toast.success("Passenger Verified Successfully!");

      // Passenger list mein status update karne ka fake logic (Jab tak backend nahi banta)
      setRidePassengers(prev => prev.map(p => p.id === bookingId ? { ...p, status: 'BOARDED' } : p));

    } catch (error: any) {
      toast.error(error.message || "Invalid OTP");
    } finally {
      setVerifyingId(null);
    }
  };

  if (isLoading) return (
    <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading Account...
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Profile Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary border border-primary/20">
          {authData.name?.[0] || "U"}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{authData.name || "User Name"}</h1>
          <p className="text-sm text-muted-foreground">{authData.email}</p>
          <Badge variant="secondary" className="mt-1 font-medium capitalize">{authData.role}</Badge>
        </div>
      </div>

      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="bookings" className="gap-2 font-semibold"><Ticket className="h-4 w-4" /> My Bookings</TabsTrigger>
          <TabsTrigger value="rides" className="gap-2 font-semibold"><Car className="h-4 w-4" /> My Posted Rides</TabsTrigger>
        </TabsList>

        {/* --- MY BOOKINGS (PASSENGER VIEW) --- */}
        <TabsContent value="bookings" className="space-y-4">
          {myBookings.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground italic border-2 border-dashed rounded-xl">No bookings found.</p>
          ) : (
            myBookings.map((b: any) => (
              <Card key={b.id} className="overflow-hidden border-l-4 border-l-blue-500 cursor-pointer hover:bg-slate-50/50" onClick={() => setSelectedBooking(b)} >
                <CardContent className="p-5">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-800 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-500" /> {b.ride?.sourceName} → {b.ride?.destinationName}
                      </div>
                      <p className="text-[10px] text-blue-600 font-medium uppercase tracking-wider">Click for Ride Details & OTP</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-[10px]">{b.seatsBooked} Seat(s)</Badge>
                      <p className="text-sm font-bold mt-1">₹{b.ride?.pricePerSeat * b.seatsBooked}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* --- MY POSTED RIDES (DRIVER VIEW) --- */}
        <TabsContent value="rides" className="space-y-4">
          {myRides.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground italic border-2 border-dashed rounded-xl">No rides posted.</p>
          ) : (
            myRides.map((r: any) => (
              <Card key={r.id} className="overflow-hidden border border-slate-200 cursor-pointer hover:bg-slate-50/50 shadow-sm" onClick={() => handleRideClick(r)}>
                <CardContent className="p-5 flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-800">{r.sourceName} → {r.destinationName}</div>
                    <p className="text-[10px] text-primary font-medium uppercase tracking-wider flex items-center gap-1">
                      <Users className="h-3 w-3" /> View passengers & Verify OTP
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-600">{r.availableSeats} Left</p>
                    <p className="text-sm font-semibold">₹{r.pricePerSeat}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* --- MODAL 1: PASSENGER BOOKING DETAILS --- */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-md">
          {/* ... (Passenger Modal ka code waisa hi hai, OTP section niche hai) ... */}
          <DialogHeader><DialogTitle className="text-lg font-bold">Ride Summary</DialogTitle></DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="font-bold text-blue-900 flex items-center gap-2"><MapPin className="h-4 w-4" /> {selectedBooking.ride?.sourceName} to {selectedBooking.ride?.destinationName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Seats Booked</p>
                  <p className="text-lg font-bold text-primary">{selectedBooking.seatsBooked}</p>
                </div>
                <div className="p-3 border rounded-lg text-center bg-slate-900 text-white">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Ride OTP</p>
                  {/* REAL APP MEIN YE BACKEND SE AAYEGA */}
                  <p className="text-lg font-black tracking-widest text-emerald-400">1234</p>
                </div>
              </div>
              <p className="text-[10px] text-center text-muted-foreground italic flex items-center justify-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Please share OTP only after boarding the ride.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* --- MODAL 2: DRIVER PASSENGER LIST & OTP VERIFICATION --- */}
      <Dialog open={!!selectedRide} onOpenChange={() => setSelectedRide(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center justify-between">
              Passenger List
              <Badge variant="outline">{ridePassengers.length} Bookings</Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedRide && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border text-sm italic text-muted-foreground">
                {selectedRide.sourceName} → {selectedRide.destinationName}
              </div>
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                {isFetchingPassengers ? (
                  <div className="flex justify-center py-6"><Loader2 className="animate-spin text-primary" /></div>
                ) : ridePassengers.length === 0 ? (
                  <p className="text-center py-4 text-sm text-muted-foreground">No bookings yet.</p>
                ) : (
                  ridePassengers.map((booking: any) => (
                    <div key={booking.id} className={`flex flex-col p-3 border rounded-lg shadow-sm transition-colors ${booking.status === 'BOARDED' ? 'bg-green-50/50 border-green-200' : 'bg-white'}`}>

                      {/* Top Row: User Details */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold border">
                            {booking.passenger?.fullName?.[0] || "P"}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{booking.passenger?.fullName}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3" /> {maskPhone(booking.passenger?.phone)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={`tel:${booking.passenger?.phone}`} className="p-2 bg-blue-50 rounded-full text-blue-600 hover:bg-blue-100">
                            <Phone className="h-3 w-3" />
                          </a>
                          <Badge variant="secondary" className="font-bold text-[10px]">{booking.seatsBooked} Seat</Badge>
                        </div>
                      </div>

                      {/* Bottom Row: OTP Verification Section 🔥 */}
                      <div className="mt-3 pt-3 border-t flex items-center justify-between">
                        {booking.status === 'BOARDED' ? (
                          <div className="flex items-center gap-2 text-green-600 font-bold text-xs bg-green-100 px-3 py-1.5 rounded-full w-full justify-center">
                            <CheckCircle2 className="h-4 w-4" /> Boarding Verified
                          </div>
                        ) : (
                          <>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-tight">Boarding OTP</div>
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="4-digit OTP"
                                maxLength={4}
                                value={otpInputs[booking.id] || ''}
                                onChange={(e) => setOtpInputs(prev => ({ ...prev, [booking.id]: e.target.value.replace(/\D/g, '') }))}
                                className="h-8 w-24 text-center text-sm font-bold tracking-widest border-slate-300"
                              />
                              <Button
                                size="sm"
                                className="h-8 px-4 font-bold text-xs"
                                disabled={verifyingId === booking.id || (otpInputs[booking.id]?.length !== 4)}
                                onClick={() => handleVerifyOtp(booking.id)}
                              >
                                {verifyingId === booking.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Verify"}
                              </Button>
                            </div>
                          </>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}