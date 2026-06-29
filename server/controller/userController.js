import User from '../model/User.js';
import Update from '../model/Update.js';


export const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error.message);
    res.status(500).json({ message: 'Server error fetching students' });
  }
};


export const updateStudentMarks = async (req, res) => {
  const { Mathematics, Physics, Chemistry, ComputerScience } = req.body;
  const studentId = req.params.id;

  try {
    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.role !== 'student') {
      return res.status(400).json({ message: 'User is not a student' });
    }

    if (Mathematics !== undefined) student.marks.Mathematics = Number(Mathematics);
    if (Physics !== undefined) student.marks.Physics = Number(Physics);
    if (Chemistry !== undefined) student.marks.Chemistry = Number(Chemistry);
    if (ComputerScience !== undefined) student.marks.ComputerScience = Number(ComputerScience);

    const updatedStudent = await student.save();
    res.json({
      _id: updatedStudent._id,
      name: updatedStudent.name,
      email: updatedStudent.email,
      role: updatedStudent.role,
      marks: updatedStudent.marks
    });
  } catch (error) {
    console.error('Update marks error:', error.message);
    res.status(500).json({ message: 'Server error updating student marks' });
  }
};

export const createUpdate = async (req, res) => {
  const { title, content } = req.body;

  try {
    if (!title || !content) {
      return res.status(400).json({ message: 'Please provide both title and content' });
    }

    const newUpdate = await Update.create({
      title,
      content,
      sentBy: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
    });

    res.status(201).json(newUpdate);
  } catch (error) {
    console.error('Create update error:', error.message);
    res.status(500).json({ message: 'Server error creating update' });
  }
};

export const getUpdates = async (req, res) => {
  try {
    const updates = await Update.find().sort({ createdAt: -1 });
    res.json(updates);
  } catch (error) {
    console.error('Get updates error:', error.message);
    res.status(500).json({ message: 'Server error fetching updates' });
  }
};

export const getSystemStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalHODs = await User.countDocuments({ role: 'hod' });
    const totalPrincipals = await User.countDocuments({ role: 'principal' });

    const students = await User.find({ role: 'student' });
    let averages = { Mathematics: 0, Physics: 0, Chemistry: 0, ComputerScience: 0, Overall: 0 };

    if (students.length > 0) {
      let sums = { Math: 0, Phys: 0, Chem: 0, CS: 0 };
      students.forEach(s => {
        sums.Math += s.marks?.Mathematics || 0;
        sums.Phys += s.marks?.Physics || 0;
        sums.Chem += s.marks?.Chemistry || 0;
        sums.CS += s.marks?.ComputerScience || 0;
      });

      averages.Mathematics = Math.round((sums.Math / students.length) * 10) / 10;
      averages.Physics = Math.round((sums.Phys / students.length) * 10) / 10;
      averages.Chemistry = Math.round((sums.Chem / students.length) * 10) / 10;
      averages.ComputerScience = Math.round((sums.CS / students.length) * 10) / 10;
      averages.Overall = Math.round(((averages.Mathematics + averages.Physics + averages.Chemistry + averages.ComputerScience) / 4) * 10) / 10;
    }

    const teachersList = await User.find({ role: 'teacher' }).select('name email createdAt');
    const hodsList = await User.find({ role: 'hod' }).select('name email createdAt');
    const studentsList = await User.find({ role: 'student' }).select('name email marks createdAt');

    res.json({
      counts: {
        students: totalStudents,
        teachers: totalTeachers,
        hods: totalHODs,
        principals: totalPrincipals,
      },
      averages,
      users: {
        teachers: teachersList,
        hods: hodsList,
        students: studentsList,
      }
    });
  } catch (error) {
    console.error('Get system stats error:', error.message);
    res.status(500).json({ message: 'Server error generating statistics' });
  }
};
