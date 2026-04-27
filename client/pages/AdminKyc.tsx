import { useEffect, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, UserCheck, FileText, ExternalLink, Loader2, RefreshCw, FileWarning } from "lucide-react";
import { toast } from "sonner";

export default function AdminKyc() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const auth = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("ridelink:auth") || "{}");
    } catch {
      return {};
    }
  }, []);

  const fetchPending = useCallback(async (showToast = false) => {
    if (!auth?.token) {
      setLoading(false);
      return;
    }

    try {
      if (showToast) setIsRefreshing(true);

      const res = await fetch("http://localhost:9090/api/admin/pending-drivers", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${auth.token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) throw new Error(`Status: ${res.status}`);

      const data = await res.json();
      console.log("Backend Response:", data); // 🔥 F12 Console mein check karein

      if (Array.isArray(data)) {
        setDrivers(data);
        if (showToast) toast.success(`Synced: ${data.length} requests found`);
      } else {
        setDrivers([]);
      }
    } catch (error: any) {
      console.error("Fetch Error:", error.message);
      toast.error("Failed to sync with server");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [auth.token]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  // 🔥 Helper function to check if file is a PDF
  const isPDF = (url: string) => url?.toLowerCase().endsWith(".pdf");

  const handleAction = async (userId: number, status: string) => {
    try {
      const res = await fetch(`http://localhost:9090/api/admin/verify-driver/${userId}?status=${status}`, {
        method: 'PUT',
        headers: { "Authorization": `Bearer ${auth.token}` }
      });
      if (res.ok) {
        toast.success(`Driver ${status} successfully!`);
        setDrivers(prev => prev.filter(d => d.id !== userId));
      } else {
        toast.error("Update failed");
      }
    } catch (error) {
      toast.error("Connection error");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 font-medium">Fetching records...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="flex items-center justify-between mb-8 border-b pb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <UserCheck className="text-primary" /> Driver KYC Portal
          </h1>
          <Badge variant="outline" className="text-lg px-4 py-1 bg-primary/5">
            {drivers.length} Pending
          </Badge>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchPending(true)}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Sync Data
        </Button>
      </div>

      {drivers.length === 0 ? (
        <div className="text-center py-24 bg-slate-50/50 rounded-3xl border-2 border-dashed">
          <UserCheck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-800">No Pending Requests</h3>
          <p className="text-slate-500 mt-1">Sabhi drivers verified hain ya koi nayi request nahi aayi.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {drivers.map((driver) => (
            <Card key={driver.id} className="overflow-hidden shadow-md">
              <CardHeader className="bg-slate-50/80 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-bold">{driver.fullName}</CardTitle>
                    <p className="text-sm text-slate-500">{driver.email} • {driver.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleAction(driver.id, "APPROVED")}>
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleAction(driver.id, "REJECTED")}>
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Documents Section */}
                  {[
                    { label: "Driving License", url: driver.licenseUrl },
                    { label: "Vehicle RC", url: driver.rcUrl }
                  ].map((doc, idx) => (
                    <div key={idx} className="space-y-3">
                      <p className="text-sm font-bold flex items-center gap-2 text-slate-700">
                        <FileText className="h-4 w-4 text-primary" /> {doc.label}
                      </p>
                      <div className="relative group rounded-xl border-2 border-slate-100 bg-slate-200 flex items-center justify-center min-h-52">
                        {isPDF(doc.url) ? (
                          <div className="text-center p-4">
                            <FileWarning className="h-10 w-10 text-orange-500 mx-auto mb-2" />
                            <p className="text-xs font-bold text-slate-600 mb-3">PDF Document</p>
                            <Button size="sm" variant="secondary" asChild>
                              <a href={doc.url} target="_blank">Open PDF <ExternalLink className="ml-1 h-3 w-3"/></a>
                            </Button>
                          </div>
                        ) : (
                          <img
                            src={doc.url || "https://placehold.co/400x300?text=No+Image"}
                            alt={doc.label}
                            className="w-full h-52 object-contain"
                          />
                        )}
                        <a href={doc.url} target="_blank" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all rounded-xl">
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}