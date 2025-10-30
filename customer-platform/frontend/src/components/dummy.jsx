

import React from 'react';

import imageline from "../../assests/imageline.png";
import meet1 from "../../assests/meet1.png";
import meet2 from "../../assests/meet2.png";
import meet3 from "../../assests/meet3.png";
import meet4 from "../../assests/meet2.png";
import arrow from "../../assests/arrow.png";
import firstarrow from "../../assests/firstarrow.png";
import line from "../../assests/line.png";
import man from "../../assests/man.png";
import linee from "../../assests/linee.png";
import vector from "../../assests/vector.png";
import line71 from "../../assests/line71.png";
import arrowimg from "../../assests/arrowimg.png";
import { MapPin, Map, ArrowLeft } from 'lucide-react';
export default function ThreeColumnLayout() {
  return (



    <>
   <div className="w-full max-w-4xl container ms-12 py-2">
      {/* Title Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Tour Itinerary</h1>
        <p className="text-sm text-gray-500">Your personalized travel plan at a glance</p>
      </div>

      {/* Top Section - Tour Badge and Map Icon */}
     <div>



         <div className="flex items-center justify- mb-4 ">
        {/* Left - Tour Badge */}
        <div className="flex items-center gap-3  rounded-lg px-4 py-2.5 bg-[#DBEAFE] ">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ">
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">One day Tour</span>
            <span className="text-xs text-gray-500">(06: 00 - 23: 15)</span>
            
          </div>
          
        </div>  <Map className="w-7 h-8 mx-2 text-blue-600" />

        {/* Right - Map Icon */}
     
        
       
      </div>

     </div>
      {/* Bottom Section - Pick-up Info */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">
          Pick-up <span className="text-sm font-normal text-gray-500 ml-2">Central Post Office</span>
        </h2>
      </div>
    </div>
    
      
    <div className=" min-h-screen container">
        
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Left Section - Hardcoded Images with Arrows & Lines */}
       <div className="lg:col-span-5  rounded-lg pt-0  min-h-[600px] flex flex-col items-start justify-start">

  {/* Stop 1 */}
 <div className="flex items-center mb-4 relative py-12">
  <img className="w-20 h-21 mr-4" src={firstarrow} alt="" />
 <div className="w-10 h-10 bg-[#3B69E2] absolute -left-[20px] top-[160px] -left-15 rounded-full flex items-center justify-center">
  <img src={man} alt="" className="w-6 h-6 object-contain rounded-full" />
</div>



  <div className="relative">
    <img src={meet1} alt="Fujinimiya" className="w-24 h-35 object-contain rounded-lg shadow-md" />
    <span className="absolute -left-[84px] pe-18 bg-red text-[#8C8B8B] top-7  px-1 py-0.5 text-xs font-semibold rounded">
      94km <br />01h : 15 min
    </span>
  </div>
</div>

  {/* Stop 2 */}
  <div className="flex items-center mb-12 relative">
     <img src={linee} alt="" className="w-8 h-[130px] mr-4 absolute -top-20  left-0 ps-1" />
     <span className='text-[#8C8B8B] absolute left-[12px] top-9'>94km</span>
      <div className="w-10 h-10 bg-[#3B69E2] absolute left-[50px] top-[1px] -left-15 rounded-full flex items-center justify-center">
  <img src={vector} alt="" className="w-6 h-6 object-contain rounded-full" />
</div>
       <img src={arrow} alt="" className="mr-5 mb-2 ms-1 "/>
  
    
    <img src={meet2} alt="Fujinimiya" className="w-24 h-50 object-contain rounded-lg shadow-md" />
  </div>
  {/* Stop 3 */}
  <div className="flex items-center mb-12 relative">
     <img src={linee} alt="" className="w-8 h-[152px] mr-4 absolute -top-[100px]  left-0 ps-1" />
     <span className='text-[#8C8B8B] absolute left-[12px] top-9'>34km</span>
      <div className="w-10 h-10 bg-[#3B69E2] absolute left-[50px] top-[1px] -left-15 rounded-full flex items-center justify-center">
  <img src={vector} alt="" className="w-6 h-6 object-contain rounded-full" />
</div>
       <img src={arrow} alt="" className="mr-5 mb-2 ms-1 "/>
  
    
    <img src={meet2} alt="Fujinimiya" className="w-24 h-50 object-contain rounded-lg shadow-md" />
  
  
  
  </div>
  <div className="flex items-center mb-12 relative">
     <img src={linee} alt="" className="w-8 h-[150px] mr-4 absolute -top-[100px]  left-0 ps-1" />
     <span className='text-[#8C8B8B] absolute left-[12px] top-9'>94km</span>
      <div className="w-10 h-10 bg-[#3B69E2] absolute left-[50px] top-[1px] -left-15 rounded-full flex items-center justify-center">
  <img src={vector} alt="" className="w-6 h-6 object-contain rounded-full" />
</div>
       <img src={arrow} alt="" className="mr-5 mb-2 ms-1 "/>
  
    
    <img src={meet2} alt="Fujinimiya" className="w-24 h-50 object-contain rounded-lg shadow-md" />
  </div>

 

  {/* Finish */}
  <div className="flex items-center gap-4   w-full ms-18">
    
  <div className="text-center flex items-center justify-center gap-2 w-50 relative">
  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
     <img src={line71} alt="" className="w-8 h-[148px] mr-4 absolute -top-[125px] -left-8 ps-1" />
<img src={arrowimg} alt="" />
  </div>
  <span className="text-sm font-semibold text-black">Finished - Return</span>
</div>

  </div>

</div>




















          {/* Center Section - Vertical Line */}
          <div className="lg:col-span-1  rounded-lg  p-0 flex flex-col justify-between items-center h-full py-2">
            <img src={imageline} alt="" className="h-44" />
            <img src={imageline} alt="" className="h-44" />
            <img src={imageline} alt="" className="h-44" />
            <img src={imageline} alt="" className="h-44" />
          </div>






































          {/* Right Section - Text Content Hardcoded */}
          <div className="lg:col-span-6  rounded-lg p-6 min-h-[600px] space-y-6">








            {/* Stop 1 */}
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base font-bold text-black">Fujinimiya</h3>
                <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                  2h 30min
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-black">Ticket:</span>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                  Free
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                Fujinomiya – thrill at the foot of Mount Fuji with stunning views, waterfalls, and adventure all around!
              </p>
              <div>
                <p className="text-xs font-semibold text-black mb-2">Activities:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Sightseeing & Photography</span>
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Food & Drink</span>
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Cultural visit</span>
                </div>
              </div>
            </div>

            {/* Stop 2 */}
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base font-bold text-black">Fujinimiya</h3>
                <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                  2h 30min
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-black">Ticket:</span>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                  Free
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                Fujinomiya – thrill at the foot of Mount Fuji with stunning views, waterfalls, and adventure all around!
              </p>
              <div>
                <p className="text-xs font-semibold text-black mb-2">Activities:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Sightseeing & Photography</span>
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Food & Drink</span>
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Cultural visit</span>
                </div>
              </div>
            </div>
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base font-bold text-black">Fujinimiya</h3>
                <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                  2h 30min
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-black">Ticket:</span>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                  Free
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                Fujinomiya – thrill at the foot of Mount Fuji with stunning views, waterfalls, and adventure all around!
              </p>
              <div>
                <p className="text-xs font-semibold text-black mb-2">Activities:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Sightseeing & Photography</span>
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Food & Drink</span>
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Cultural visit</span>
                </div>
              </div>
            </div>
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base font-bold text-black">Fujinimiya</h3>
                <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                  2h 30min
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-black">Ticket:</span>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                  Free
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                Fujinomiya – thrill at the foot of Mount Fuji with stunning views, waterfalls, and adventure all around!
              </p>
              <div>
                <p className="text-xs font-semibold text-black mb-2">Activities:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Sightseeing & Photography</span>
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Food & Drink</span>
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Cultural visit</span>
                </div>
              </div>
            </div>

            {/* Similarly add Stop 3 & Stop 4 manually here... */}

            {/* Finished Section */}
            <div className="flex items-center gap-2 mt-6 pt-4">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <h3 className="text-base font-bold text-black">Finished - Return</h3>
            </div>

          </div>
        </div>
      </div>
    </div>
     </>
  );
}
