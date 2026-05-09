import React from 'react';
import { motion } from 'motion/react';
import { Clock, Calendar } from 'lucide-react';
import Card, { CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SectionHeading from '../components/ui/SectionHeading';

const CourseSection = () => {
  const courses = [
    {
      title: "Basic Baking Course",
      duration: "4 Weeks",
      mode: "Online & Offline",
      price: "₹4,999",
      timing: "10 AM - 12 PM | 5 PM - 7 PM",
      topics: ["Cake Basics", "Frosting Techniques", "Cupcakes", "Cookies"],
      features: ["Certificate", "Recipe Notes", "Recorded Sessions"],
      image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Advanced Cake Decorating",
      duration: "6 Weeks",
      mode: "Offline Only",
      price: "₹9,999",
      timing: "Sat & Sun 11 AM - 3 PM",
      topics: ["Fondant Art", "Wedding Cake Design", "Tier Cakes", "Chocolate Garnishing"],
      features: ["Premium Tools Provided", "AC Classroom", "1-on-1 Mentorship"],
      image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Eggless Baking Program",
      duration: "3 Weeks",
      mode: "Online Only",
      price: "₹2,999",
      timing: "Daily 6 PM - 9:30 PM",
      topics: ["Eggless Sponges", "Healthy Alternatives", "Vegan Baking Basics"],
      features: ["Zoom Live Classes", "Lifetime Access", "WhatsApp Support"],
      image: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=600"
    }
  ];

  return (
    <section className="py-24 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Our Featured Courses" />

        <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:overflow-x-visible md:snap-none md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 scrollbar-hide">
          {courses.map((course, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="min-w-[85vw] sm:min-w-[60vw] md:min-w-0 snap-center shrink-0 h-full"
            >
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  <Badge className="absolute top-4 right-4" variant="dark">
                    {course.mode}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <h3 className="text-xl font-serif text-brand-dark mb-3 leading-tight">{course.title}</h3>
                  
                  <div className="flex flex-wrap gap-3 mb-4 text-xs text-brand-brown">
                    <div className="flex items-center"><Clock size={14} className="mr-1 text-brand-gold"/> {course.duration}</div>
                    <div className="flex items-center"><Calendar size={14} className="mr-1 text-brand-gold"/> {course.timing}</div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-sm text-brand-dark mb-2">Topics Covered:</h4>
                    <ul className="text-xs text-brand-brown space-y-1">
                      {course.topics.map((topic, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-brand-gold mr-2">•</span> {topic}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <CardFooter className="px-0 pb-0 border-t-0">
                    <div className="text-xl font-bold text-brand-dark">{course.price}</div>
                    <Button size="sm">
                      Enroll Now
                    </Button>
                  </CardFooter>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseSection;
