// public/admin-console.js - Script à coller dans la console pour l'administration rapide

// =================== NUDEET ADMIN CONSOLE TOOLS ===================
// Copiez et collez ce script entier dans la console de votre navigateur (F12)

window.NudeetAdmin = {
  // Configuration
  ADMIN_PASSWORD: 'admin123', // Changez en production

  // =============== GESTION DES UTILISATEURS ===============
  
  // Voir tous les utilisateurs dans localStorage
  getAllUsers() {
    console.log('🔍 Recherche de tous les utilisateurs...');
    const users = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('nudeet_user_')) {
        try {
          const userData = JSON.parse(localStorage.getItem(key));
          if (userData.userId) {
            users.push({
              storageKey: key,
              deviceId: key.replace('nudeet_user_', ''),
              ...userData
            });
          }
        } catch (e) {
          console.error('❌ Erreur parsing user:', key);
        }
      }
    });
    
    console.log(`✅ Trouvé ${users.length} utilisateurs:`);
    console.table(users);
    return users;
  },

  // Trouver un utilisateur par device ID
  findUser(deviceId) {
    console.log(`🔍 Recherche utilisateur: ${deviceId}`);
    const key = `nudeet_user_${deviceId}`;
    let userData = localStorage.getItem(key);
    
    if (!userData) {
      // Recherche partielle
      const keys = Object.keys(localStorage);
      const userKey = keys.find(k => k.includes(deviceId));
      if (userKey) {
        userData = localStorage.getItem(userKey);
        console.log(`✅ Trouvé avec clé partielle: ${userKey}`);
      }
    }
    
    if (userData) {
      const user = JSON.parse(userData);
      console.log('👤 Utilisateur trouvé:', user);
      return user;
    } else {
      console.error(`❌ Utilisateur ${deviceId} introuvable`);
      return null;
    }
  },

  // Ajouter des crédits
  addCredits(deviceId, amount) {
    console.log(`💎 Ajout de ${amount} crédits à ${deviceId}`);
    const key = `nudeet_user_${deviceId}`;
    let userData = localStorage.getItem(key);
    
    if (!userData) {
      const keys = Object.keys(localStorage);
      const userKey = keys.find(k => k.includes(deviceId));
      if (userKey) {
        userData = localStorage.getItem(userKey);
      }
    }
    
    if (userData) {
      const user = JSON.parse(userData);
      const oldCredits = user.credits || 0;
      user.credits = oldCredits + amount;
      localStorage.setItem(key, JSON.stringify(user));
      
      console.log(`✅ Crédits mis à jour:
        🏷️  Device: ${deviceId}
        📊 Avant: ${oldCredits}
        ➕ Ajouté: ${amount}
        💎 Nouveau total: ${user.credits}`);
      
      return user.credits;
    } else {
      console.error(`❌ Utilisateur ${deviceId} introuvable`);
      return false;
    }
  },

  // Définir un nombre exact de crédits
  setCredits(deviceId, exactAmount) {
    console.log(`🎯 Définition de ${exactAmount} crédits pour ${deviceId}`);
    const key = `nudeet_user_${deviceId}`;
    let userData = localStorage.getItem(key);
    
    if (!userData) {
      const keys = Object.keys(localStorage);
      const userKey = keys.find(k => k.includes(deviceId));
      if (userKey) {
        userData = localStorage.getItem(userKey);
      }
    }
    
    if (userData) {
      const user = JSON.parse(userData);
      const oldCredits = user.credits || 0;
      user.credits = exactAmount;
      localStorage.setItem(key, JSON.stringify(user));
      
      console.log(`✅ Crédits définis:
        🏷️  Device: ${deviceId}
        📊 Avant: ${oldCredits}  
        💎 Nouveau: ${exactAmount}`);
      
      return true;
    } else {
      console.error(`❌ Utilisateur ${deviceId} introuvable`);
      return false;
    }
  },

  // Bloquer/débloquer un utilisateur
  blockUser(deviceId, blocked = true) {
    console.log(`${blocked ? '🚫 Blocage' : '✅ Déblocage'} de l'utilisateur ${deviceId}`);
    const key = `nudeet_user_${deviceId}`;
    let userData = localStorage.getItem(key);
    
    if (!userData) {
      const keys = Object.keys(localStorage);
      const userKey = keys.find(k => k.includes(deviceId));
      if (userKey) {
        userData = localStorage.getItem(userKey);
      }
    }
    
    if (userData) {
      const user = JSON.parse(userData);
      user.isBlocked = blocked;
      localStorage.setItem(key, JSON.stringify(user));
      
      console.log(`✅ Utilisateur ${blocked ? 'bloqué' : 'débloqué'}: ${deviceId}`);
      return true;
    } else {
      console.error(`❌ Utilisateur ${deviceId} introuvable`);
      return false;
    }
  },

  // =============== STATISTIQUES ===============
  
  getStats() {
    console.log('📊 Calcul des statistiques...');
    const users = this.getAllUsers();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    const stats = {
      totalUsers: users.length,
      activeUsers24h: users.filter(u => new Date(u.lastVisitDate) >= yesterday).length,
      totalCredits: users.reduce((sum, u) => sum + (u.credits || 0), 0),
      totalGenerations: users.reduce((sum, u) => sum + (u.totalGenerations || 0), 0),
      blockedUsers: users.filter(u => u.isBlocked).length,
      usersWithCredits: users.filter(u => (u.credits || 0) > 0).length,
      avgCreditsPerUser: Math.round((users.reduce((sum, u) => sum + (u.credits || 0), 0) / users.length) * 100) / 100
    };
    
    console.log('📈 Statistiques globales:');
    console.table(stats);
    return stats;
  },

  // =============== MAINTENANCE ===============
  
  cleanOldUsers(daysOld = 30) {
    console.log(`🧹 Nettoyage des utilisateurs inactifs depuis ${daysOld} jours...`);
    const keys = Object.keys(localStorage);
    const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    let cleaned = 0;
    
    keys.forEach(key => {
      if (key.startsWith('nudeet_user_')) {
        try {
          const userData = JSON.parse(localStorage.getItem(key));
          const lastVisit = new Date(userData.lastVisitDate).getTime();
          
          if (lastVisit < cutoffDate) {
            localStorage.removeItem(key);
            cleaned++;
            console.log(`🗑️ Supprimé: ${key.replace('nudeet_user_', '')}`);
          }
        } catch (e) {
          // Supprimer les données corrompues
          localStorage.removeItem(key);
          cleaned++;
          console.log(`🔧 Supprimé données corrompues: ${key}`);
        }
      }
    });
    
    console.log(`✅ ${cleaned} utilisateurs anciens/corrompus supprimés`);
    return cleaned;
  },

  // Sauvegarder tous les utilisateurs (export)
  exportUsers() {
    console.log('💾 Export de tous les utilisateurs...');
    const users = this.getAllUsers();
    const exportData = {
      timestamp: new Date().toISOString(),
      totalUsers: users.length,
      users: users
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `nudeet-users-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`✅ Export de ${users.length} utilisateurs terminé`);
    return exportData;
  },

  // =============== OUTILS RAPIDES ===============
  
  // Donner des crédits à tous les utilisateurs actifs
  giveCreditsToAllActive(amount = 5) {
    console.log(`🎁 Distribution de ${amount} crédits à tous les utilisateurs actifs...`);
    const users = this.getAllUsers();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let updated = 0;
    
    users.forEach(user => {
      if (new Date(user.lastVisitDate) >= yesterday && !user.isBlocked) {
        this.addCredits(user.deviceId, amount);
        updated++;
      }
    });
    
    console.log(`✅ ${amount} crédits donnés à ${updated} utilisateurs actifs`);
    return updated;
  },

  // Recherche par email ou nom (si vous stockez ces infos)
  search(term) {
    console.log(`🔍 Recherche: "${term}"`);
    const users = this.getAllUsers();
    const results = users.filter(user => 
      user.userId.toLowerCase().includes(term.toLowerCase()) ||
      user.deviceId.toLowerCase().includes(term.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(term.toLowerCase()))
    );
    
    console.log(`✅ ${results.length} résultats trouvés:`);
    console.table(results);
    return results;
  },

  // =============== RACCOURCIS PRATIQUES ===============
  
  // Raccourcis pour les actions courantes
  quickAdd(deviceId, credits = 10) {
    return this.addCredits(deviceId, credits);
  },

  quickBlock(deviceId) {
    return this.blockUser(deviceId, true);
  },

  quickUnblock(deviceId) {
    return this.blockUser(deviceId, false);
  },

  quickInfo(deviceId) {
    return this.findUser(deviceId);
  },

  // =============== AIDE ===============
  
  help() {
    console.log(`
🔧 NUDEET ADMIN CONSOLE TOOLS
===============================

👥 GESTION UTILISATEURS:
NudeetAdmin.getAllUsers()                    - Voir tous les utilisateurs
NudeetAdmin.findUser('device_id')            - Trouver un utilisateur
NudeetAdmin.addCredits('device_id', amount)  - Ajouter des crédits
NudeetAdmin.setCredits('device_id', amount)  - Définir crédits exacts
NudeetAdmin.blockUser('device_id', true)     - Bloquer utilisateur
NudeetAdmin.blockUser('device_id', false)    - Débloquer utilisateur

📊 STATISTIQUES:
NudeetAdmin.getStats()                       - Voir les statistiques
NudeetAdmin.search('terme')                  - Rechercher utilisateurs

🛠️ MAINTENANCE:
NudeetAdmin.cleanOldUsers(30)                - Nettoyer anciens utilisateurs
NudeetAdmin.exportUsers()                    - Exporter tous les utilisateurs
NudeetAdmin.giveCreditsToAllActive(5)        - Crédits à tous les actifs

⚡ RACCOURCIS:
NudeetAdmin.quickAdd('device_id', 10)        - Ajouter 10 crédits rapidement
NudeetAdmin.quickBlock('device_id')          - Bloquer rapidement
NudeetAdmin.quickUnblock('device_id')        - Débloquer rapidement
NudeetAdmin.quickInfo('device_id')           - Info utilisateur rapide

📖 AIDE:
NudeetAdmin.help()                           - Afficher cette aide

EXEMPLES:
NudeetAdmin.getAllUsers()
NudeetAdmin.quickAdd('device_abc123', 20)
NudeetAdmin.getStats()
    `);
  }
};

// Auto-load et message de bienvenue
console.log(`
🚀 NUDEET ADMIN TOOLS CHARGÉS
===============================
Tapez: NudeetAdmin.help() pour voir toutes les commandes

Exemples rapides:
• NudeetAdmin.getAllUsers()
• NudeetAdmin.quickAdd('device_abc123', 10)  
• NudeetAdmin.getStats()

Version: 1.0 | Password: ${window.NudeetAdmin.ADMIN_PASSWORD}
`);

// Exposer aussi sous un nom plus court
window.NA = window.NudeetAdmin;