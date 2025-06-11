// Node.js script to clean up duplicate users
const fs = require('fs')
const path = require('path')

const SHARED_DB_PATH = 'C:\\WEBSITES\\shared_data\\unified_users.json'

async function cleanupUsers() {
  try {
    console.log('🧹 Starting user cleanup...')
    
    const data = fs.readFileSync(SHARED_DB_PATH, 'utf-8')
    const parsed = JSON.parse(data)
    const users = parsed.users || parsed
    
    console.log('📊 Current users:', Object.keys(users))
    
    // Group users by device ID
    const deviceGroups = {}
    Object.values(users).forEach(user => {
      if (!deviceGroups[user.deviceId]) {
        deviceGroups[user.deviceId] = []
      }
      deviceGroups[user.deviceId].push(user)
    })
    
    // Merge duplicates
    const cleanedUsers = {}
    
    Object.entries(deviceGroups).forEach(([deviceId, userList]) => {
      if (userList.length === 1) {
        // No duplicates
        const user = userList[0]
        cleanedUsers[user.userId] = user
      } else {
        // Merge duplicates - keep the one with most credits/generations
        console.log(`🔧 Merging ${userList.length} users for device ${deviceId}`)
        
        const bestUser = userList.reduce((best, current) => {
          // Priority: most credits > most generations > newest
          if (current.credits > best.credits) return current
          if (current.credits === best.credits && current.totalGenerations > best.totalGenerations) return current
          if (current.credits === best.credits && current.totalGenerations === best.totalGenerations) {
            return new Date(current.lastVisitDate) > new Date(best.lastVisitDate) ? current : best
          }
          return best
        })
        
        // Merge all data into the best user
        const mergedUser = {
          ...bestUser,
          credits: Math.max(...userList.map(u => u.credits)),
          totalGenerations: Math.max(...userList.map(u => u.totalGenerations)),
          totalFreeTrialsUsed: Math.max(...userList.map(u => u.totalFreeTrialsUsed)),
          sitesUsed: [...new Set(userList.flatMap(u => u.sitesUsed))],
          firstVisitDate: userList.reduce((earliest, user) => 
            user.firstVisitDate < earliest ? user.firstVisitDate : earliest
          , userList[0].firstVisitDate),
          lastSyncDate: new Date().toISOString()
        }
        
        cleanedUsers[mergedUser.userId] = mergedUser
        console.log(`✅ Kept user: ${mergedUser.userId} with ${mergedUser.credits} credits`)
      }
    })
    
    // Write cleaned data
    const cleanedData = {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      users: cleanedUsers
    }
    
    fs.writeFileSync(SHARED_DB_PATH, JSON.stringify(cleanedData, null, 2))
    
    console.log('✅ Cleanup complete!')
    console.log(`📊 Before: ${Object.keys(users).length} users`)
    console.log(`📊 After: ${Object.keys(cleanedUsers).length} users`)
    
    Object.values(cleanedUsers).forEach(user => {
      console.log(`👤 ${user.userId}: ${user.credits} credits, device: ${user.deviceId}`)
    })
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
  }
}

cleanupUsers()