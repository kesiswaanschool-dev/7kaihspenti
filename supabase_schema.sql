-- Create Students table
CREATE TABLE public.students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nama_murid TEXT NOT NULL,
    kelas TEXT NOT NULL,
    nis TEXT NOT NULL UNIQUE,
    wali_kelas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Habits Log table (7 KAIH)
CREATE TABLE public.habits_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    semester TEXT NOT NULL,
    
    -- Checklists (true = done, false = not done)
    bangun_pagi BOOLEAN DEFAULT false,
    keterangan_bangun_pagi TEXT,
    
    beribadah BOOLEAN DEFAULT false,
    keterangan_beribadah TEXT,
    
    berolahraga BOOLEAN DEFAULT false,
    keterangan_berolahraga TEXT,
    
    makan_sehat BOOLEAN DEFAULT false,
    keterangan_makan_sehat TEXT,
    
    gemar_belajar BOOLEAN DEFAULT false,
    keterangan_gemar_belajar TEXT,
    
    bermasyarakat BOOLEAN DEFAULT false,
    keterangan_bermasyarakat TEXT,
    
    tidur_cepat BOOLEAN DEFAULT false,
    keterangan_tidur_cepat TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure only one entry per student per day
    UNIQUE(student_id, tanggal)
);

-- Optional: Create Users table if not using Supabase Auth directly for simplicity
-- Since the requirement says: "INPUT DATA LOGIN DAN SEDIAKAN TEMPLET IMPORT LOGIN UNTUK USER LOGIN NYA ID MENGUNAKAN NAMA MURID DAN PASSWORD : NIS MURID"
-- We can just use the `students` table to verify login for students.
-- For Admin, we can have a separate `admins` table.

CREATE TABLE public.admins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default admin
INSERT INTO public.admins (username, password) VALUES ('admin', 'Spenti1985!');

-- Setup RLS (Row Level Security)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create policies that allow anon access for simplicity since we handle auth in app layer
-- Note: For a real production app, you should use Supabase Auth and strictly configure these policies.
CREATE POLICY "Allow anon select on students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow anon insert on students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on students" ON public.students FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete on students" ON public.students FOR DELETE USING (true);

CREATE POLICY "Allow anon select on habits_log" ON public.habits_log FOR SELECT USING (true);
CREATE POLICY "Allow anon insert on habits_log" ON public.habits_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on habits_log" ON public.habits_log FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete on habits_log" ON public.habits_log FOR DELETE USING (true);

CREATE POLICY "Allow anon select on admins" ON public.admins FOR SELECT USING (true);
CREATE POLICY "Allow anon insert on admins" ON public.admins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on admins" ON public.admins FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete on admins" ON public.admins FOR DELETE USING (true);
