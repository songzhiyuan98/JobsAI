import { ArrowRight, FileSearch, FileText, Award, Zap } from "lucide-react";
export default function FeatureSection() {
  // ...直接复制你原来的HeroSection内容...
  return (
    <section id="features" className="w-full py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">为什么选择 TalentSync</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            我们的AI技术帮助您精准匹配职位需求，提高求职成功率，让您的职业发展与理想岗位同步
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-6 mx-auto">
              <FileSearch className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-3">简历与职位匹配分析</h3>
            <p className="text-sm text-gray-600">
              智能分析您的简历与目标职位的匹配度，提供详细的改进建议，帮助您提高求职成功率。
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-6 mx-auto">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-3">智能求职信生成</h3>
            <p className="text-sm text-gray-600">
              基于您的简历和目标职位，自动生成个性化、专业的求职信，突出您的相关经验和技能。
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-6 mx-auto">
              <Award className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-3">多种AI模型选择</h3>
            <p className="text-sm text-gray-600">
              提供多种顶级AI模型选择，包括GPT-4、GPT-3.5、Gemini等，满足不同需求和预算。
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-6 mx-auto">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-3">快速高效</h3>
            <p className="text-sm text-gray-600">
              在几分钟内完成分析和生成，节省您的时间和精力，让求职过程更加高效。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
