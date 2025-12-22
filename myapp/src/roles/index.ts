import { Hono } from 'hono'
import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'
import db from '../db/index.js' // ตรวจสอบ path ให้ตรงกับโปรเจกต์คุณ

const rolesRoutes = new Hono()

type Role = {
  id: number;
  name: string;
}

// Schema สำหรับตรวจสอบข้อมูล (Validation)
const createRoleSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ Role")
})

// 1. Get all roles
rolesRoutes.get('/', (c) => {
  const sql = 'SELECT * FROM roles'
  const stmt = db.prepare(sql)
  const roles = stmt.all()
  return c.json({ message: 'list of Roles', data: roles })
})

// 2. Get role by ID
rolesRoutes.get('/:id', (c) => {
  const id = c.req.param('id')
  const sql = 'SELECT * FROM roles WHERE id = ?'
  const role = db.prepare(sql).get(id)

  if (!role) {
    return c.json({ message: 'Role not found' }, 404)
  }
  return c.json({ message: `Role details for ID: ${id}`, data: role })
})

// 3. Create new role
rolesRoutes.post('/', zValidator('json', createRoleSchema), (c) => {
  const body = c.req.valid('json')
  
  try {
    const sql = 'INSERT INTO roles (name) VALUES (?)'
    const info = db.prepare(sql).run(body.name)
    
    const newRole = db.prepare('SELECT * FROM roles WHERE id = ?').get(info.lastInsertRowid)
    return c.json({ message: 'Role created', data: newRole }, 201)
  } catch (err) {
    return c.json({ message: 'Error creating role', error: err }, 500)
  }
})

// 4. Update role
rolesRoutes.put('/:id', zValidator('json', createRoleSchema), (c) => {
  const id = c.req.param('id')
  const body = c.req.valid('json')
  
  const sql = 'UPDATE roles SET name = ? WHERE id = ?'
  const info = db.prepare(sql).run(body.name, id)

  if (info.changes === 0) {
    return c.json({ message: 'Role not found' }, 404)
  }
  return c.json({ message: 'Role updated' })
})

// 5. Delete role
rolesRoutes.delete('/:id', (c) => {
  const id = c.req.param('id')
  const info = db.prepare('DELETE FROM roles WHERE id = ?').run(id)

  if (info.changes === 0) {
    return c.json({ message: 'Role not found' }, 404)
  }
  return c.json({ message: 'Role deleted' })
})

export default rolesRoutes