import { prisma } from "@/lib/prisma";
import { AuditAction } from "@prisma/client";

interface AuditLogData {
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  changes?: Record<string, { oldValue: any; newValue: any }>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Service d'audit pour enregistrer toutes les actions dans le système
 * Utilise le modèle AuditLog de Prisma
 */
export const AuditService = {
  /**
   * Enregistre une action d'audit complète
   */
  async logAction({
    userId,
    action,
    entityType,
    entityId,
    changes,
    ipAddress,
    userAgent,
  }: AuditLogData) {
    try {
      const auditLog = await prisma.auditLog.create({
        data: {
          userId,
          action: action as unknown as string,
          entityType,
          entityId,
          changes: changes ? JSON.stringify(changes) : null,
          ipAddress,
          userAgent,
          timestamp: new Date(),
        },
      });

      return auditLog;
    } catch (error) {
      console.error("❌ Erreur lors de l'enregistrement d'audit:", error);
      throw error;
    }
  },

  /**
   * Enregistre une connexion utilisateur
   */
  async logLogin(userId: string, ipAddress?: string, userAgent?: string) {
    return this.logAction({
      userId,
      action: "LOGIN" as AuditAction,
      entityType: "User",
      entityId: userId,
      ipAddress,
      userAgent,
    });
  },

  /**
   * Enregistre une déconnexion utilisateur
   */
  async logLogout(userId: string, ipAddress?: string) {
    return this.logAction({
      userId,
      action: "LOGOUT" as AuditAction,
      entityType: "User",
      entityId: userId,
      ipAddress,
    });
  },

  /**
   * Enregistre la création d'un patient
   */
  async logCreatePatient(userId: string, patientId: string, patientData: any) {
    return this.logAction({
      userId,
      action: "CREATE_PATIENT" as AuditAction,
      entityType: "Patient",
      entityId: patientId,
      changes: {
        created: {
          oldValue: null,
          newValue: patientData,
        },
      },
    });
  },

  /**
   * Enregistre la mise à jour d'un patient
   */
  async logUpdatePatient(
    userId: string,
    patientId: string,
    oldData: any,
    newData: any
  ) {
    return this.logAction({
      userId,
      action: "UPDATE_PATIENT" as AuditAction,
      entityType: "Patient",
      entityId: patientId,
      changes: this.computeChanges(oldData, newData),
    });
  },

  /**
   * Enregistre la création d'une signes vital
   */
  async logCreateVitalSign(userId: string, vitalRecordId: string, vitalData: any) {
    return this.logAction({
      userId,
      action: "CREATE_VITAL_SIGN" as AuditAction,
      entityType: "VitalRecord",
      entityId: vitalRecordId,
      changes: {
        created: {
          oldValue: null,
          newValue: vitalData,
        },
      },
    });
  },

  /**
   * Enregistre la mise à jour d'une signes vital
   */
  async logUpdateVitalSign(
    userId: string,
    vitalRecordId: string,
    oldData: any,
    newData: any
  ) {
    return this.logAction({
      userId,
      action: "UPDATE_VITAL_SIGN" as AuditAction,
      entityType: "VitalRecord",
      entityId: vitalRecordId,
      changes: this.computeChanges(oldData, newData),
    });
  },

  /**
   * Enregistre la suppression d'une signes vital
   */
  async logDeleteVitalSign(userId: string, vitalRecordId: string, vitalData: any) {
    return this.logAction({
      userId,
      action: "DELETE_VITAL_SIGN" as AuditAction,
      entityType: "VitalRecord",
      entityId: vitalRecordId,
      changes: {
        deleted: {
          oldValue: vitalData,
          newValue: null,
        },
      },
    });
  },

  /**
   * Enregistre la création d'un utilisateur
   */
  async logCreateUser(userId: string, newUserId: string, userData: any) {
    return this.logAction({
      userId,
      action: "CREATE_USER" as AuditAction,
      entityType: "User",
      entityId: newUserId,
      changes: {
        created: {
          oldValue: null,
          newValue: userData,
        },
      },
    });
  },

  /**
   * Enregistre la mise à jour d'un utilisateur
   */
  async logUpdateUser(userId: string, updatedUserId: string, userData: any) {
    return this.logAction({
      userId,
      action: "UPDATE_USER" as AuditAction,
      entityType: "User",
      entityId: updatedUserId,
      changes: {
        updated: {
          oldValue: null,
          newValue: userData,
        },
      },
    });
  },

  /**
   * Enregistre la création d'une alerte
   */
  async logCreateAlert(userId: string, alertId: string, alertData: any) {
    return this.logAction({
      userId,
      action: "CREATE_ALERT" as AuditAction,
      entityType: "Alert",
      entityId: alertId,
      changes: {
        created: {
          oldValue: null,
          newValue: alertData,
        },
      },
    });
  },

  /**
   * Enregistre l'accusé de réception d'une alerte
   */
  async logAcknowledgeAlert(userId: string, alertId: string) {
    return this.logAction({
      userId,
      action: "ACKNOWLEDGE_ALERT" as AuditAction,
      entityType: "Alert",
      entityId: alertId,
      changes: {
        status: {
          oldValue: "OPEN",
          newValue: "ACKNOWLEDGED",
        },
      },
    });
  },

  /**
   * Enregistre la résolution d'une alerte
   */
  async logResolveAlert(userId: string, alertId: string, resolution: string) {
    return this.logAction({
      userId,
      action: "RESOLVE_ALERT" as AuditAction,
      entityType: "Alert",
      entityId: alertId,
      changes: {
        status: {
          oldValue: "ACKNOWLEDGED",
          newValue: "RESOLVED",
        },
        resolution: {
          oldValue: null,
          newValue: resolution,
        },
      },
    });
  },

  /**
   * Enregistre la création d'un questionnaire
   */
  async logCreateQuestionnaire(
    userId: string,
    questionnaireId: string,
    questionnaireData: any
  ) {
    return this.logAction({
      userId,
      action: "CREATE_QUESTIONNAIRE" as AuditAction,
      entityType: "QuestionnaireTemplate",
      entityId: questionnaireId,
      changes: {
        created: {
          oldValue: null,
          newValue: questionnaireData,
        },
      },
    });
  },

  /**
   * Enregistre la soumission d'une réponse questionnaire
   */
  async logSubmitQuestionnaire(
    userId: string,
    questionnaireId: string,
    responses: any
  ) {
    return this.logAction({
      userId,
      action: "SUBMIT_QUESTIONNAIRE" as AuditAction,
      entityType: "QuestionnaireResponse",
      entityId: questionnaireId,
      changes: {
        responses: {
          oldValue: null,
          newValue: responses,
        },
      },
    });
  },

  /**
   * Enregistre l'octroi d'accès
   */
  async logGrantAccess(userId: string, targetUserId: string, accessType: string) {
    return this.logAction({
      userId,
      action: "GRANT_ACCESS" as AuditAction,
      entityType: "AccessGrant",
      entityId: targetUserId,
      changes: {
        access: {
          oldValue: "NONE",
          newValue: accessType,
        },
      },
    });
  },

  /**
   * Enregistre la révocation d'accès
   */
  async logRevokeAccess(userId: string, targetUserId: string) {
    return this.logAction({
      userId,
      action: "REVOKE_ACCESS" as AuditAction,
      entityType: "AccessGrant",
      entityId: targetUserId,
      changes: {
        access: {
          oldValue: "GRANTED",
          newValue: "REVOKED",
        },
      },
    });
  },

  /**
   * Enregistre le téléchargement d'un document
   */
  async logDownloadDocument(userId: string, documentId: string, documentName: string) {
    return this.logAction({
      userId,
      action: "DOWNLOAD_DOCUMENT" as AuditAction,
      entityType: "MedicalDocument",
      entityId: documentId,
      changes: {
        document: {
          oldValue: null,
          newValue: documentName,
        },
      },
    });
  },

  /**
   * Enregistre l'export de données
   */
  async logExportData(userId: string, dataType: string, recordCount: number) {
    return this.logAction({
      userId,
      action: "EXPORT_DATA" as AuditAction,
      entityType: "Export",
      changes: {
        export: {
          oldValue: null,
          newValue: { dataType, recordCount },
        },
      },
    });
  },

  /**
   * ⛓️ BLOCKCHAIN AUDIT LOGS
   */

  /**
   * Enregistre une transaction blockchain
   */
  async logBlockchainTransaction(
    userId: string,
    txHash: string,
    txType: "GRANT_ACCESS" | "REVOKE_ACCESS" | "LOG_ACCESS" | "WALLET_CREATION",
    entityId: string,
    data: any
  ) {
    return this.logAction({
      userId,
      action: ("BLOCKCHAIN_" + txType) as any,
      entityType: "BlockchainTransaction",
      entityId: txHash,
      changes: {
        transaction: {
          oldValue: null,
          newValue: {
            txType,
            entityId,
            timestamp: new Date().toISOString(),
            network: process.env.BLOCKCHAIN_NETWORK || "aptos-testnet",
            ...data,
          },
        },
      },
    });
  },

  /**
   * Enregistre un accès patient vérifié via blockchain
   */
  async logBlockchainAccessVerified(
    doctorId: string,
    patientId: string,
    txHash: string,
    isVerified: boolean
  ) {
    return this.logAction({
      userId: doctorId,
      action: "BLOCKCHAIN_ACCESS_VERIFY" as any,
      entityType: "BlockchainAccess",
      entityId: patientId,
      changes: {
        verification: {
          oldValue: null,
          newValue: {
            doctorId,
            patientId,
            isVerified,
            txHash,
            timestamp: new Date().toISOString(),
          },
        },
      },
    });
  },

  /**
   * Enregistre une allocation de wallet utilisateur
   */
  async logWalletAllocation(userId: string, walletAddress: string) {
    return this.logAction({
      userId,
      action: "WALLET_CREATED" as any,
      entityType: "BlockchainWallet",
      entityId: userId,
      changes: {
        wallet: {
          oldValue: null,
          newValue: {
            walletAddress,
            network: process.env.BLOCKCHAIN_NETWORK || "aptos-testnet",
            allocatedAt: new Date().toISOString(),
          },
        },
      },
    });
  },

  /**
   * Enregistre une erreur blockchain
   */
  async logBlockchainError(
    userId: string,
    errorType: string,
    errorMessage: string,
    context: any
  ) {
    return this.logAction({
      userId,
      action: "BLOCKCHAIN_ERROR" as any,
      entityType: "BlockchainError",
      changes: {
        error: {
          oldValue: null,
          newValue: {
            errorType,
            errorMessage,
            context,
            timestamp: new Date().toISOString(),
          },
        },
      },
    });
  },

  /**
   * Récupère les logs d'audit pour un utilisateur
   */
  async getUserAuditLogs(userId: string, limit = 100) {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  },

  /**
   * Récupère les logs d'audit pour une entité
   */
  async getEntityAuditLogs(entityType: string, entityId?: string, limit = 100) {
    return prisma.auditLog.findMany({
      where: {
        entityType,
        ...(entityId && { entityId }),
      },
      orderBy: { timestamp: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  },

  /**
   * Récupère tous les logs d'audit (pour l'auditeur)
   */
  async getAllAuditLogs(filters?: {
    action?: string;
    entityType?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    return prisma.auditLog.findMany({
      where: {
        ...(filters?.action && { action: filters.action }),
        ...(filters?.entityType && { entityType: filters.entityType }),
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.startDate &&
          filters?.endDate && {
            timestamp: {
              gte: filters.startDate,
              lte: filters.endDate,
            },
          }),
      },
      orderBy: { timestamp: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  },

  /**
   * Génère un rapport d'audit pour une période donnée
   */
  async generateAuditReport(startDate: Date, endDate: Date) {
    const logs = await prisma.auditLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Agrégation des statistiques
    const stats = {
      totalActions: logs.length,
      actionsByType: {} as Record<string, number>,
      actionsByEntity: {} as Record<string, number>,
      actionsByUser: {} as Record<string, number>,
    };

    logs.forEach((log) => {
      stats.actionsByType[log.action] = (stats.actionsByType[log.action] || 0) + 1;
      stats.actionsByEntity[log.entityType] =
        (stats.actionsByEntity[log.entityType] || 0) + 1;
      stats.actionsByUser[log.user.email] = (stats.actionsByUser[log.user.email] || 0) + 1;
    });

    return {
      period: { startDate, endDate },
      statistics: stats,
      logs,
    };
  },

  /**
   * Fonction utilitaire pour calculer les changements
   */
  private computeChanges(oldData: any, newData: any) {
    const changes: Record<string, { oldValue: any; newValue: any }> = {};

    const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);

    allKeys.forEach((key) => {
      if (oldData?.[key] !== newData?.[key]) {
        changes[key] = {
          oldValue: oldData?.[key],
          newValue: newData?.[key],
        };
      }
    });

    return changes;
  },
};
