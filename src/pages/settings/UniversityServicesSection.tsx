import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { get, post, put, del } from "@/lib/api";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FileText,
  MapPin,
  Clock,
  DollarSign,
  GripVertical,
  Eye,
  EyeOff,
} from "lucide-react";

interface UniversityService {
  id: number;
  name: string;
  description: string;
  category: string;
  fee: number;
  processing_time: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface ServiceRequest {
  id: number;
  student_id: string;
  student_name: string;
  service_id: number;
  service_name: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface OfficeLocation {
  id: number;
  name: string;
  building: string;
  room: string;
  hours: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const SERVICE_CATEGORIES = [
  "Academic Documents",
  "Identification",
  "Official Letters",
  "Financial",
  "Other",
];

const SERVICE_ICONS = [
  "FileText",
  "IdCard",
  "GraduationCap",
  "Mail",
  "BookCopy",
  "Building2",
  "CreditCard",
  "Printer",
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",
  READY: "bg-green-100 text-green-800 border-green-200",
  COMPLETED: "bg-gray-100 text-gray-800 border-gray-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

export default function UniversityServicesSection() {
  const [services, setServices] = useState<UniversityService[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [offices, setOffices] = useState<OfficeLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [officeModalOpen, setOfficeModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<UniversityService | null>(null);
  const [editingOffice, setEditingOffice] = useState<OfficeLocation | null>(null);

  const [serviceName, setServiceName] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [serviceFee, setServiceFee] = useState("");
  const [serviceTime, setServiceTime] = useState("");
  const [serviceIcon, setServiceIcon] = useState("FileText");
  const [serviceActive, setServiceActive] = useState(true);
  const [serviceOrder, setServiceOrder] = useState("0");

  const [officeName, setOfficeName] = useState("");
  const [officeBuilding, setOfficeBuilding] = useState("");
  const [officeRoom, setOfficeRoom] = useState("");
  const [officeHours, setOfficeHours] = useState("");
  const [officeOrder, setOfficeOrder] = useState("0");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, r, o] = await Promise.all([
        get<UniversityService[]>("/university-services/"),
        get<ServiceRequest[]>("/service-requests/"),
        get<OfficeLocation[]>("/office-locations/"),
      ]);
      setServices(Array.isArray(s) ? s : []);
      setRequests(Array.isArray(r) ? r : []);
      setOffices(Array.isArray(o) ? o : []);
    } catch {
      toast.error("Failed to load university services data");
    } finally {
      setLoading(false);
    }
  };

  const openCreateService = () => {
    setEditingService(null);
    setServiceName("");
    setServiceDesc("");
    setServiceCategory("");
    setServiceFee("");
    setServiceTime("");
    setServiceIcon("FileText");
    setServiceActive(true);
    setServiceOrder("0");
    setServiceModalOpen(true);
  };

  const openEditService = (s: UniversityService) => {
    setEditingService(s);
    setServiceName(s.name);
    setServiceDesc(s.description || "");
    setServiceCategory(s.category);
    setServiceFee(String(s.fee));
    setServiceTime(s.processing_time);
    setServiceIcon(s.icon || "FileText");
    setServiceActive(s.is_active);
    setServiceOrder(String(s.sort_order));
    setServiceModalOpen(true);
  };

  const handleSaveService = async () => {
    if (!serviceName || !serviceCategory || !serviceFee || !serviceTime) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: serviceName,
        description: serviceDesc,
        category: serviceCategory,
        fee: parseFloat(serviceFee),
        processing_time: serviceTime,
        icon: serviceIcon,
        is_active: serviceActive,
        sort_order: parseInt(serviceOrder) || 0,
      };
      if (editingService) {
        await put(`/university-services/${editingService.id}/`, payload);
        toast.success("Service updated");
      } else {
        await post("/university-services/", payload);
        toast.success("Service created");
      }
      setServiceModalOpen(false);
      fetchAll();
    } catch {
      toast.error("Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm("Delete this service?")) return;
    try {
      await del(`/university-services/${id}/`);
      toast.success("Service deleted");
      fetchAll();
    } catch {
      toast.error("Failed to delete service");
    }
  };

  const handleToggleService = async (s: UniversityService) => {
    try {
      await put(`/university-services/${s.id}/`, { is_active: !s.is_active });
      toast.success(s.is_active ? "Service deactivated" : "Service activated");
      fetchAll();
    } catch {
      toast.error("Failed to update service");
    }
  };

  const openCreateOffice = () => {
    setEditingOffice(null);
    setOfficeName("");
    setOfficeBuilding("");
    setOfficeRoom("");
    setOfficeHours("");
    setOfficeOrder("0");
    setOfficeModalOpen(true);
  };

  const openEditOffice = (o: OfficeLocation) => {
    setEditingOffice(o);
    setOfficeName(o.name);
    setOfficeBuilding(o.building);
    setOfficeRoom(o.room);
    setOfficeHours(o.hours);
    setOfficeOrder(String(o.sort_order));
    setOfficeModalOpen(true);
  };

  const handleSaveOffice = async () => {
    if (!officeName || !officeBuilding || !officeRoom || !officeHours) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: officeName,
        building: officeBuilding,
        room: officeRoom,
        hours: officeHours,
        sort_order: parseInt(officeOrder) || 0,
      };
      if (editingOffice) {
        await put(`/office-locations/${editingOffice.id}/`, payload);
        toast.success("Office location updated");
      } else {
        await post("/office-locations/", payload);
        toast.success("Office location created");
      }
      setOfficeModalOpen(false);
      fetchAll();
    } catch {
      toast.error("Failed to save office location");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOffice = async (id: number) => {
    if (!confirm("Delete this office location?")) return;
    try {
      await del(`/office-locations/${id}/`);
      toast.success("Office location deleted");
      fetchAll();
    } catch {
      toast.error("Failed to delete office location");
    }
  };

  const handleUpdateRequestStatus = async (req: ServiceRequest, newStatus: string) => {
    try {
      await put(`/service-requests/${req.id}/status`, { status: newStatus });
      toast.success("Status updated");
      fetchAll();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const categories = [...new Set(services.map((s) => s.category))];
  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-8">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading university services...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">University Services</h3>
          <p className="text-sm text-muted-foreground">
            Manage services, requests, and office locations
          </p>
        </div>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {pendingCount} pending request{pendingCount !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services" className="gap-2">
            <FileText className="h-4 w-4" />
            Services ({services.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            <Clock className="h-4 w-4" />
            Requests ({requests.length})
          </TabsTrigger>
          <TabsTrigger value="offices" className="gap-2">
            <MapPin className="h-4 w-4" />
            Offices ({offices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreateService} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          </div>

          {categories.map((cat) => (
            <div key={cat} className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                {cat}
              </h4>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Fee (UGX)</TableHead>
                      <TableHead>Processing Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services
                      .filter((s) => s.category === cat)
                      .map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{s.name}</div>
                              {s.description && (
                                <div className="text-xs text-muted-foreground line-clamp-1">
                                  {s.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{s.fee?.toLocaleString()}</TableCell>
                          <TableCell>{s.processing_time}</TableCell>
                          <TableCell>
                            <Badge
                              variant={s.is_active ? "default" : "secondary"}
                              className={
                                s.is_active
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : ""
                              }
                            >
                              {s.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleToggleService(s)}
                                title={s.is_active ? "Deactivate" : "Activate"}
                              >
                                {s.is_active ? (
                                  <Eye className="h-4 w-4" />
                                ) : (
                                  <EyeOff className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditService(s)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDeleteService(s.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}

          {services.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No services configured yet. Click "Add Service" to create one.
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{r.student_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.student_id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{r.service_name}</TableCell>
                    <TableCell>
                      {r.created_at
                        ? new Date(r.created_at).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={STATUS_COLORS[r.status] || ""}
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {r.notes || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={r.status}
                        onValueChange={(val) =>
                          handleUpdateRequestStatus(r, val)
                        }
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="PROCESSING">Processing</SelectItem>
                          <SelectItem value="READY">Ready</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {requests.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No service requests yet.
            </div>
          )}
        </TabsContent>

        <TabsContent value="offices" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreateOffice} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Office
            </Button>
          </div>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Office</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offices.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.name}</TableCell>
                    <TableCell>
                      {o.building} &bull; {o.room}
                    </TableCell>
                    <TableCell>{o.hours}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditOffice(o)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteOffice(o.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {offices.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No office locations configured yet.
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={serviceModalOpen} onOpenChange={setServiceModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Edit Service" : "Add Service"}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? "Update the service details below."
                : "Create a new university service."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="svc-name">Service Name *</Label>
              <Input
                id="svc-name"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g. Academic Transcript"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="svc-desc">Description</Label>
              <Input
                id="svc-desc"
                value={serviceDesc}
                onChange={(e) => setServiceDesc(e.target.value)}
                placeholder="Brief description of the service"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={serviceCategory} onValueChange={setServiceCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select value={serviceIcon} onValueChange={setServiceIcon}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_ICONS.map((ic) => (
                      <SelectItem key={ic} value={ic}>
                        {ic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="svc-fee">Fee (UGX) *</Label>
                <Input
                  id="svc-fee"
                  type="number"
                  value={serviceFee}
                  onChange={(e) => setServiceFee(e.target.value)}
                  placeholder="50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="svc-time">Processing Time *</Label>
                <Input
                  id="svc-time"
                  value={serviceTime}
                  onChange={(e) => setServiceTime(e.target.value)}
                  placeholder="5-7 working days"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="svc-order">Sort Order</Label>
                <Input
                  id="svc-order"
                  type="number"
                  value={serviceOrder}
                  onChange={(e) => setServiceOrder(e.target.value)}
                />
              </div>
              <div className="space-y-2 flex items-end pb-1">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={serviceActive}
                    onCheckedChange={setServiceActive}
                  />
                  <Label className="cursor-pointer">
                    {serviceActive ? "Active" : "Inactive"}
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setServiceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveService} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingService ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={officeModalOpen} onOpenChange={setOfficeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingOffice ? "Edit Office Location" : "Add Office Location"}
            </DialogTitle>
            <DialogDescription>
              {editingOffice
                ? "Update the office location details."
                : "Add a new document collection office."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="off-name">Office Name *</Label>
              <Input
                id="off-name"
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                placeholder="e.g. Academic Registry"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="off-building">Building *</Label>
              <Input
                id="off-building"
                value={officeBuilding}
                onChange={(e) => setOfficeBuilding(e.target.value)}
                placeholder="e.g. Senate Building"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="off-room">Room *</Label>
                <Input
                  id="off-room"
                  value={officeRoom}
                  onChange={(e) => setOfficeRoom(e.target.value)}
                  placeholder="e.g. Ground Floor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="off-hours">Hours *</Label>
                <Input
                  id="off-hours"
                  value={officeHours}
                  onChange={(e) => setOfficeHours(e.target.value)}
                  placeholder="e.g. 8:00 AM - 5:00 PM"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="off-order">Sort Order</Label>
              <Input
                id="off-order"
                type="number"
                value={officeOrder}
                onChange={(e) => setOfficeOrder(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOfficeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveOffice} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingOffice ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
