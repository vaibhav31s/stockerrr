import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Try a simple query
    const userCount = await prisma.user.count()
    
    await prisma.$disconnect()
    
    return NextResponse.json({ 
      success: true,
      message: 'Database connected successfully!',
      userCount,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      error: error.message,
      code: error.code,
      details: error.toString(),
      environment: process.env.NODE_ENV
    }, { status: 500 })
  }
}
