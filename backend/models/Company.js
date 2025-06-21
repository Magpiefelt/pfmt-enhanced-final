// Company Model for PFMT Enhanced Application
// Represents contractor/supplier companies in a CRM-style approach

export class Company {
  constructor(data = {}) {
    this.id = data.id || null
    this.name = data.name || ''
    this.contactPerson = data.contactPerson || ''
    this.contactEmail = data.contactEmail || ''
    this.contactPhone = data.contactPhone || ''
    this.address = data.address || ''
    this.city = data.city || ''
    this.province = data.province || ''
    this.postalCode = data.postalCode || ''
    this.website = data.website || ''
    this.businessNumber = data.businessNumber || ''
    this.notes = data.notes || ''
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || new Date().toISOString()
  }

  // Validate required fields
  validate() {
    const errors = []
    
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Company name is required')
    }
    
    if (this.contactEmail && !this.isValidEmail(this.contactEmail)) {
      errors.push('Invalid email format')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Helper method to validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Convert to plain object for database storage
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      contactPerson: this.contactPerson,
      contactEmail: this.contactEmail,
      contactPhone: this.contactPhone,
      address: this.address,
      city: this.city,
      province: this.province,
      postalCode: this.postalCode,
      website: this.website,
      businessNumber: this.businessNumber,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  // Create Company instance from database data
  static fromJSON(data) {
    return new Company(data)
  }

  // Update company data
  update(data) {
    Object.keys(data).forEach(key => {
      if (key !== 'id' && key !== 'createdAt' && this.hasOwnProperty(key)) {
        this[key] = data[key]
      }
    })
    this.updatedAt = new Date().toISOString()
  }
}

export default Company

