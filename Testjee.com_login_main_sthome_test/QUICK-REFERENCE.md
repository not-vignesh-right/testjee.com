# Quick Reference - Student Name Persistence

## 🚀 Quick Start (3 Steps)

1. **Run SQL Migration**
   ```sql
   -- In Supabase SQL Editor, run: supabase-migration.sql
   ```

2. **Test Locally**
   ```bash
   npm run dev
   ```

3. **Verify**
   - Login with name + email
   - Check name appears in HeaderBar
   - Submit exam and verify student_id in database

## 📁 Files Changed

| File | What Changed |
|------|--------------|
| `src/stores/authStore.js` | Added student profile management |
| `src/stores/examStore.js` | Removed hardcoded name, use authStore |
| `src/components/AuthCallback.vue` | Call fetchOrCreateStudent() |
| `src/components/Login.vue` | Store name in localStorage |
| `src/components/HeaderBar.vue` | Display authStore.studentName |

## 🔑 Key Functions

### authStore.fetchOrCreateStudent()
```javascript
// Called after login to create/fetch student profile
await auth.fetchOrCreateStudent()

// Access student data
console.log(auth.studentName)  // "John Doe"
console.log(auth.studentId)    // 123
```

### examStore.submitExam()
```javascript
// Now uses actual student_id
await examStore.submitExam()
// Inserts: { student_id: 123, answers: [...], score: 85 }
```

## 🗄️ Database Schema

```sql
-- Students table (add this column)
ALTER TABLE students 
ADD COLUMN supabase_user_id UUID UNIQUE;

-- Results table (already exists, now properly linked)
-- student_id now references actual student, not null
```

## 🔒 Security (RLS)

```sql
-- Students can only see their own data
CREATE POLICY "Students can view own profile" 
ON students FOR SELECT 
USING (auth.uid() = supabase_user_id);

-- Students can only see their own results
CREATE POLICY "Students can view own results" 
ON results FOR SELECT 
USING (student_id IN (
  SELECT student_id FROM students 
  WHERE supabase_user_id = auth.uid()
));
```

## 🔄 Data Flow

```
Login → Magic Link → AuthCallback → fetchOrCreateStudent()
                                           ↓
                                    Check if exists
                                           ↓
                                    Create/Fetch profile
                                           ↓
                                    Store in authStore
                                           ↓
                                    Display in HeaderBar
                                           ↓
                                    Use in submitExam()
```

## ✅ Testing Checklist

- [ ] New user signup creates student record
- [ ] Name appears in HeaderBar
- [ ] Exam submission has student_id (not null)
- [ ] Returning user sees existing name
- [ ] No duplicate student records

## 🐛 Quick Debugging

### Check Student Profile
```javascript
// Browser console
const auth = useAuthStore()
console.log(auth.studentProfile)
```

### Check Database
```sql
-- See recent students
SELECT * FROM students ORDER BY creation_date DESC LIMIT 5;

-- See recent results with student names
SELECT r.*, s.student_name 
FROM results r 
JOIN students s ON r.student_id = s.student_id 
ORDER BY r.created_at DESC LIMIT 5;
```

### Check Auth Session
```javascript
// Browser console
const { data } = await supabase.auth.getSession()
console.log(data.session?.user)
```

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| Name shows "Student" | Check user_metadata or localStorage |
| student_id is null | Verify fetchOrCreateStudent() called |
| Duplicate students | Check UNIQUE constraint on supabase_user_id |
| RLS errors | Verify policies created and auth.uid() matches |

## 📚 Documentation Files

- `IMPLEMENTATION-NOTES.md` - Technical details
- `SETUP-GUIDE.md` - Step-by-step setup
- `CHANGES-SUMMARY.md` - High-level overview
- `ARCHITECTURE-DIAGRAM.md` - Visual flow diagrams
- `DEPLOYMENT-CHECKLIST.md` - Production deployment steps
- `supabase-migration.sql` - Database migration script

## 🔗 Important Links

- Supabase Dashboard: [Your Supabase URL]
- SQL Editor: Dashboard → SQL Editor
- Auth Settings: Dashboard → Authentication → URL Configuration
- RLS Policies: Dashboard → Database → Tables → Policies

## 💡 Pro Tips

1. **Always test with real email** - Magic links won't work with fake emails
2. **Clear localStorage** - When testing new signups
3. **Check Supabase logs** - For RLS policy violations
4. **Use Vue DevTools** - To inspect Pinia stores
5. **Backup before migration** - Export students table first

## 📞 Need Help?

1. Check `SETUP-GUIDE.md` troubleshooting section
2. Review browser console for errors
3. Check Supabase logs for database errors
4. Verify RLS policies are active
5. Test with Vue DevTools to inspect store state
