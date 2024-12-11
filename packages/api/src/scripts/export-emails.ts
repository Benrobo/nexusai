import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

// Get current file path in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function exportEmails() {
  const prisma = new PrismaClient()
  
  try {
    // Fetch all unique emails
    const users = await prisma.users.findMany({
      select: {
        email: true,
      },
      distinct: ['email'], // Ensure unique emails only
    })

    // Create CSV content - one email per line
    const uniqueEmails = [...new Set(users.map(user => user.email))] // Extra safety for uniqueness
    const csvContent = uniqueEmails.join('\n')

    // Create exports directory if it doesn't exist
    const exportDir = path.join(__dirname, '../../../exports')
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true })
    }

    // Write to file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filePath = path.join(exportDir, `emails-${timestamp}.csv`)
    
    fs.writeFileSync(filePath, csvContent)
    
    console.log(`Emails exported successfully to: ${filePath}`)
    console.log(`Total unique emails exported: ${uniqueEmails.length}`)

  } catch (error) {
    console.error('Error exporting emails:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the export
exportEmails() 