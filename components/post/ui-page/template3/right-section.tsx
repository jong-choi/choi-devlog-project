"use client";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

const RightSection = () => {
  return (
    <aside className="w-80 bg-[#F7F6F3] p-6 border-l border-gray-300 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        What is MUSHRA?
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        MUSHRA (Multiple Stimuli with Hidden Reference and Anchor) is a
        subjective listening test developed by the International
        Telecommunication Union (ITU) to evaluate audio quality in
        intermediate-quality systems.
      </p>
      <p className="text-sm text-gray-600 mt-2 leading-relaxed">
        It is used in scenarios like streaming, mobile multimedia, and digital
        radio, where subtle audio impairments can affect user experience. MUSHRA
        assesses the noticeability and impact of these imperfections when issues
        are neither minor nor severe.
      </p>
      <p className="text-sm text-gray-600 mt-2 leading-relaxed">
        The methodology has been updated several times, with ITU-R BS.1534-3
        being the latest revision.
      </p>

      <Button className="w-full mt-4 bg-white border border-gray-300 text-gray-700 shadow-sm flex items-center gap-2 py-2 rounded-lg hover:bg-gray-100">
        <Info size={16} /> View Documentation
      </Button>

      <blockquote className="mt-6 text-gray-700 text-sm italic border-l-4 border-gray-400 pl-4">
        &quot;AppName delivered precise, insightful audio quality assessments,
        helping us optimize our compression algorithms with confidence. Highly
        professional and reliable!&quot;
      </blockquote>
      <p className="mt-3 text-sm font-semibold text-gray-700">Chase Johnson</p>
      <p className="text-xs text-gray-500">CEO @ Acme, LLC</p>
    </aside>
  );
};

export default RightSection;
