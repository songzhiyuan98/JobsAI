export default function TestimonialsSection() {
  // ...直接复制你原来的HeroSection内容...
  const testimonials = [
    {
      id: 1,
      content:
        "TalentSync帮我优化了简历，让我成功获得了梦想中的产品经理职位。AI生成的求职信非常专业，完美匹配了职位需求。",
      author: "张明",
      role: "产品经理 @ 腾讯",
      avatar: "/placeholder.svg?height=40&width=40",
      platform: "LinkedIn",
    },
    {
      id: 2,
      content:
        "作为一名应届毕业生，我很担心自己的简历不够突出。TalentSync不仅帮我分析了简历的优缺点，还给出了具体的改进建议，让我在竞争激烈的市场中脱颖而出。",
      author: "李婷",
      role: "数据分析师 @ 阿里巴巴",
      avatar: "/placeholder.svg?height=40&width=40",
      platform: "Twitter",
    },
    {
      id: 3,
      content:
        "我尝试了市面上很多简历工具，但TalentSync是唯一一个真正理解技术职位需求的。它生成的求职信精准抓住了我的技术优势，帮我获得了多个面试机会。",
      author: "王强",
      role: "高级开发工程师 @ 字节跳动",
      avatar: "/placeholder.svg?height=40&width=40",
      platform: "知乎",
    },
  ];

  return (
    <section id="testimonials" className="w-full py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">用户评价</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            看看其他求职者如何使用TalentSync成功获得理想工作
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white border-none shadow-sm hover:shadow-md transition-shadow rounded-lg"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-2">💬</div>
                  <div className="text-sm text-gray-500">
                    {testimonial.platform}
                  </div>
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.author}
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
