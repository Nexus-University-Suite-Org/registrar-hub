import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const updateExistingStudents = async () => {
  try {
    console.log("Starting student data migration...");

    // Fetch all students
    const studentsQuery = query(
      collection(db, "profiles"),
      where("role", "==", "student")
    );

    const querySnapshot = await getDocs(studentsQuery);
    console.log(`Found ${querySnapshot.docs.length} students to check`);

    let updatedCount = 0;

    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      const updates: any = {};

      // Check if department is missing or empty
      if (!data.department || data.department.trim() === "") {
        updates.department = "Not Assigned"; // Default department
      }

      // Check if program is missing or empty
      if (!data.program || data.program.trim() === "") {
        updates.program = "Not Assigned"; // Default program
      }

      // If there are updates to make
      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, "profiles", docSnapshot.id), {
          ...updates,
          updated_at: new Date()
        });
        updatedCount++;
        console.log(`Updated student ${docSnapshot.id}:`, updates);
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} students.`);
    return updatedCount;
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};