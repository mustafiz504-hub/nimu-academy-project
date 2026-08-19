import React from "react";
import { View, Text, ScrollView } from "react-native";
import CourseCard from "./CourseCard";

import type { Course } from "../../types/course.types";

interface CourseItem extends Course {
  backgroundColor?: string;
  iconName?: any;
  accentColor?: string;
  accentBgColor?: string;
}

interface CourseListProps {
  courses: CourseItem[];
}

export default function CourseList({ courses }: CourseListProps) {
  if (courses.length === 0) {
    return <Text style={{ color: "#94A3B8", marginVertical: 16, fontSize: 12, fontWeight: "600" }}>No courses found.</Text>;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingRight: 20, paddingVertical: 12 }}>
      {courses.map((course, idx) => (
        <CourseCard
          key={idx}
          course={course}
          backgroundColor={course.backgroundColor}
          iconName={course.iconName}
          accentColor={course.accentColor}
          accentBgColor={course.accentBgColor}
        />
      ))}
    </ScrollView>
  );
}
