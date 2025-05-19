export default function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      content:
        "During my job search, I needed to tailor my resume for different companies. TalentSync not only analyzed multiple target positions but also provided multi-perspective optimization suggestions: from ATS keyword matching to HR screening and technical evaluation, comprehensively enhancing my resume's competitiveness and helping me successfully enter candidate pools at multiple companies.",
      author: "Alex Chen",
      role: "Software Engineering Graduate",
      avatar: "https://i.pravatar.cc/150?img=32",
      platform: "LinkedIn",
      platformIcon:
        "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg",
    },
    {
      id: 2,
      content:
        "TalentSync's AI cover letter feature is incredibly powerful! It deeply analyzes target companies' tech stacks and business characteristics to generate highly customized cover letters. Each cover letter I submitted perfectly matched company requirements, increasing my interview success rate by nearly 3x and helping me secure offers from multiple desired companies.",
      author: "David Wang",
      role: "Computer Science Graduate",
      avatar: "https://i.pravatar.cc/150?img=8",
      platform: "GitHub",
      platformIcon:
        "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/github.svg",
    },
    {
      id: 3,
      content:
        "As a sophomore CS student, I've always wondered how far I am from job market requirements. TalentSync not only analyzed the gap between my resume and target positions but also provided specific learning recommendations, giving me a clearer direction for future development.",
      author: "CodeMaster_Leo",
      role: "Computer Science Sophomore",
      avatar: "https://i.pravatar.cc/150?img=12",
      platform: "小红书",
      platformIcon:
        "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/xiaohongshu.svg",
    },
  ];

  return (
    <section id="testimonials" className="w-full py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">User Testimonials</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See how other job seekers successfully landed their dream jobs with
            TalentSync
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white border-none shadow-sm hover:shadow-md transition-shadow rounded-lg flex flex-col"
            >
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <img
                      src={testimonial.platformIcon}
                      alt={testimonial.platform}
                      className="w-4 h-4 mr-2"
                    />
                    {testimonial.platform}
                  </div>
                </div>
                <p className="text-gray-700 mb-6 italic flex-grow">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center mt-auto">
                  <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
