import { Hono } from 'hono'
import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'
import db from '../db/index.js'

const api = new Hono()

// กำหนดเงื่อนไข: ชื่อต้องเป็นตัวอักษร 2 ตัวขึ้นไป
const roleSchema = z.object({
  name: z.string().min(2, "ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร")
})

// [GET] ดึงข้อมูลทั้งหมด
api.get('/', (c) => {
  const rows = db.prepare('SELECT * FROM roles ORDER BY id DESC').all()
  return c.json({
    success: true,
    count: rows.length,
    data: rows
  })
})

// [POST] เพิ่มข้อมูลใหม่ พร้อมระบบดักจับชื่อซ้ำ
api.post('/', zValidator('json', roleSchema), (c) => {
  const { name } = c.req.valid('json')
  
  try {
    const query = db.prepare('INSERT INTO roles (name) VALUES (?)').run(name)
    return c.json({
      success: true,
      message: "บันทึกข้อมูลเรียบร้อย",
      id: query.lastInsertRowid
    }, 201)
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return c.json({ success: false, message: "ชื่อนี้มีอยู่ในระบบแล้ว" }, 400)
    }
    return c.json({ success: false, message: "เกิดข้อผิดพลาดในการบันทึก" }, 500)
  }
})

// [PUT] แก้ไขข้อมูล
api.put('/:id', zValidator('json', roleSchema), (c) => {
  const id = c.req.param('id')
  const { name } = c.req.valid('json')
  
  const result = db.prepare('UPDATE roles SET name = ? WHERE id = ?').run(name, id)
  
  if (result.changes === 0) {
    return c.json({ success: false, message: "ไม่พบข้อมูลที่ต้องการแก้ไข" }, 404)
  }
  return c.json({ success: true, message: "แก้ไขข้อมูลสำเร็จ" })
})

// [DELETE] ลบข้อมูล
api.delete('/:id', (c) => {
  const id = c.req.param('id')
  try {
    const result = db.prepare('DELETE FROM roles WHERE id = ?').run(id)
    if (result.changes === 0) return c.json({ message: "ไม่พบ ID นี้" }, 404)
    return c.json({ success: true, message: "ลบข้อมูลสำเร็จ" })
  } catch (error) {
    return c.json({ success: false, message: "ไม่สามารถลบได้เนื่องจากข้อมูลมีการใช้งานอยู่" }, 400)
  }
})

export default api