"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Select,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, FileText, Activity, Wallet } from "lucide-react";
import {
  getAuditLogs,
  getAuditStats,
  getUserList,
  getLoginHistory,
  getPatientModificationHistory,
  getVitalSignModificationHistory,
  getAlertModificationHistory,
} from "@/lib/actions/audit.actions";
import { BlockchainAuditTab } from "@/components/BlockchainAuditTab";

const AUDIT_ACTIONS = [
  "LOGIN",
  "LOGOUT",
  "CREATE_PATIENT",
  "UPDATE_PATIENT",
  "DELETE_PATIENT",
  "CREATE_VITAL_SIGN",
  "UPDATE_VITAL_SIGN",
  "DELETE_VITAL_SIGN",
  "CREATE_ALERT",
  "ACKNOWLEDGE_ALERT",
  "RESOLVE_ALERT",
  "DELETE_ALERT",
  "CREATE_QUESTIONNAIRE",
  "SUBMIT_QUESTIONNAIRE",
  "UPLOAD_DOCUMENT",
  "DOWNLOAD_DOCUMENT",
];

const ENTITY_TYPES = [
  "User",
  "Patient",
  "VitalRecord",
  "Alert",
  "QuestionnaireTemplate",
  "MedicalDocument",
  "AnalysisRequest",
];

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: any;
  timestamp: string | Date; // Can be string from server or Date from client
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
  };
}

interface Stats {
  totalActions: number;
  actionsByType: Record<string, number>;
  actionsByEntity: Record<string, number>;
  actionsByUser: Record<string, number>;
}

export function AuditDashboard() {
  const searchParams = useSearchParams();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [selectedEntityType, setSelectedEntityType] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Tab selection
  const [activeTab, setActiveTab] = useState<
    "all" | "logins" | "patients" | "analysis" | "blockchain"
  >("all");

  useEffect(() => {
    // Check for tab parameter in URL
    const tabParam = searchParams.get("tab");
    if (tabParam === "blockchain") {
      setActiveTab("blockchain");
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const userList = await getUserList();
      setUsers(userList);

      const endDateObj = new Date();
      const startDateObj = new Date(
        endDateObj.getTime() - 30 * 24 * 60 * 60 * 1000
      );

      const auditStats = await getAuditStats(startDateObj, endDateObj);
      setStats(auditStats);

      const auditLogs = await getAuditLogs({
        limit: 200,
        startDate: startDateObj,
        endDate: endDateObj,
      });

      // Ensure logs array exists
      setLogs(auditLogs || []);

      setStartDate(format(startDateObj, "yyyy-MM-dd"));
      setEndDate(format(endDateObj, "yyyy-MM-dd"));
    } catch (error) {
      console.error("Error loading data:", error);
      setLogs([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleFilter() {
    setLoading(true);
    try {
      const filters: any = {
        limit: 200,
      };

      if (selectedAction && selectedAction !== "all")
        filters.action = selectedAction;
      if (selectedEntityType && selectedEntityType !== "all")
        filters.entityType = selectedEntityType;
      if (selectedUser && selectedUser !== "all") filters.userId = selectedUser;
      if (startDate) filters.startDate = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filters.endDate = end;
      }

      const auditLogs = await getAuditLogs(filters);
      setLogs(auditLogs);
    } catch (error) {
      console.error("Error filtering logs:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadLoginHistory() {
    setLoading(true);
    setActiveTab("logins");
    try {
      const loginLogs = await getLoginHistory(selectedUser || undefined, 30);
      setLogs(loginLogs as any);
    } catch (error) {
      console.error("Error loading login history:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPatientHistory() {
    setLoading(true);
    setActiveTab("patients");
    try {
      const patientLogs = await getAuditLogs({
        entityType: "Patient",
        limit: 200,
      });
      setLogs(patientLogs as any);
    } catch (error) {
      console.error("Error loading patient history:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadAnalysisHistory() {
    setLoading(true);
    setActiveTab("analysis");
    try {
      const vitalAndAlertLogs = await getAuditLogs({
        entityType: "VitalRecord",
        limit: 200,
      });
      setLogs(vitalAndAlertLogs as any);
    } catch (error) {
      console.error("Error loading analysis history:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(timestamp: string | Date | undefined): string {
    if (!timestamp) return "N/A";
    try {
      const date =
        typeof timestamp === "string" ? new Date(timestamp) : timestamp;
      if (isNaN(date.getTime())) return "Invalid Date";
      return format(date, "dd/MM/yyyy HH:mm:ss");
    } catch (error) {
      console.error("Error formatting date:", error, timestamp);
      return "Error";
    }
  }

  function getSeverityColor(action: string) {
    if (action.includes("DELETE")) return "destructive";
    if (action.includes("UPDATE")) return "secondary";
    if (action.includes("CREATE")) return "default";
    if (action.includes("ACKNOWLEDGE") || action.includes("RESOLVE"))
      return "outline";
    return "secondary";
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          📋 Audit & Conformité
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Suivi complet de toutes les actions et modifications du système
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <Link href="/admin/audit/logs" className="block h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity size={24} className="text-blue-500" />
                Logs d'Audit
              </CardTitle>
              <CardDescription>Voir tous les logs d'audit</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Accédez aux logs complets avec recherche et filtrage avancé
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <Link href="/admin/audit/users" className="block h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={24} className="text-purple-500" />
                Utilisateurs
              </CardTitle>
              <CardDescription>
                Gérer les utilisateurs du système
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Consultez l'activité et les informations des utilisateurs
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <Link href="/admin/audit/reports" className="block h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={24} className="text-green-500" />
                Rapports
              </CardTitle>
              <CardDescription>Générer des rapports d'audit</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Créez et téléchargez des rapports personnalisés
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Actions Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActions}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Derniers 30 jours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Types d'Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(stats.actionsByType).length}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Actions uniques
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Entités Modifiées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(stats.actionsByEntity).length}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Types d'entités
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Utilisateurs Actifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(stats.actionsByUser).length}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Membres du système
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => {
            setActiveTab("all");
            loadData();
          }}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "all"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          Tous les Logs
        </button>
        <button
          onClick={loadLoginHistory}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "logins"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          Historique des Connexions
        </button>
        <button
          onClick={loadPatientHistory}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "patients"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          Patients {loading && activeTab === "patients" && ".."}
        </button>
        <button
          onClick={loadAnalysisHistory}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "analysis"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          Signes Vitaux & Alertes {loading && activeTab === "analysis" && ".."}
        </button>
        <button
          onClick={() => setActiveTab("blockchain")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "blockchain"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          <Wallet size={16} />
          Blockchain Aptos
        </button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium">Action</label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les actions</SelectItem>
                  {AUDIT_ACTIONS.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Type d'Entité</label>
              <Select
                value={selectedEntityType}
                onValueChange={setSelectedEntityType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {ENTITY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Utilisateur</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les utilisateurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les utilisateurs</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Date Début</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Date Fin</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={handleFilter} disabled={loading}>
              Filtrer
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedAction("all");
                setSelectedEntityType("all");
                setSelectedUser("all");
                loadData();
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Blockchain Tab */}
      {activeTab === "blockchain" && <BlockchainAuditTab />}

      {/* Audit Logs Table */}
      {activeTab !== "blockchain" && (
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "logins"
                ? "Historique des Connexions"
                : activeTab === "patients"
                  ? "Modifications des Patients"
                  : activeTab === "analysis"
                    ? "Signes Vitaux & Alertes"
                    : "Logs d'Audit"}
            </CardTitle>
            <CardDescription>
              {logs.length} entrées • {loading ? "Chargement..." : "À jour"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Heure</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entité</TableHead>
                    <TableHead>Détails</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Chargement...
                      </TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-gray-500"
                      >
                        Aucun log trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {formatDate(log.timestamp)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {log.user?.email || "Unknown"}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {log.user?.firstName} {log.user?.lastName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityColor(log.action) as any}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>{log.entityType}</div>
                          {log.entityId && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                              {log.entityId.substring(0, 8)}...
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {log.changes && (
                            <details className="cursor-pointer">
                              <summary className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                Voir détails
                              </summary>
                              <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded max-h-40 overflow-auto">
                                {typeof log.changes === "string"
                                  ? log.changes
                                  : JSON.stringify(log.changes, null, 2)}
                              </pre>
                            </details>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
