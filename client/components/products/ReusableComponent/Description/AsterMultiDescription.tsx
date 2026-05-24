import Image from "next/image";
import React from "react";

export default function AsterMultiDescription() {
  return (
    <div className="px-6 py-6 text-sm text-[#666]">
      <h1 className="text-3xl text-[#333]">Aster Multiseat Software for MS Windows 11/10/8/7</h1>
      <div className="mt-1 space-y-5">
        <p>
          ASTER is a program (and only a program!) that allows to creation of a
          few workplaces on base of a single PC.
        </p>
        <p>
          ASTER is a multiseat software for Windows 11/10/8/7. ASTER does not
          use any thin clients and terminal stations. ASTER is being
          successfully used not only for equipping computer classes, libraries,
          offices, and Internet cafes but even for games and video!
        </p>
        <p>
          To create an additional workplace - you just connect 1 more monitor
          (you can connect to the same video card), a keyboard, and a mouse to
          your computer (and if it is needed - a microphone, speaker, joystick,
          or gamepad).
        </p>
        <p>
          Monitors may be connected by VGA/DVI/HDMI/DP cables. It is also
          possible to use external monitors (preferably DisplayLink monitors)
          via USB or WIFI/LAN connections. After installing and launching, ASTER
          will provide each user with its independent desktop
        </p>
      </div>
      <Image  src={"https://shop.softsheba.com/wp-content/uploads/2023/11/connections.png"} alt="aster image" width={900} height={600}/>
      <p className="mt-2">
       After the installation, the ASTER will provide an individual desktop for each monitor and you can use all workplaces independently as if each of them had their PC. 
      </p>
      <h3 className="text-[26px] text-[#333] mt-3">
        Benefits of ASTER:
      </h3>
      <ul className="pl-4 mt-2 space-y-2 list-disc">
        <li>Low noise level</li>
<li>Space is saved </li>
<li>Upgrading costs are cut down </li>
<li>Easy application </li>
<li>Electric power is saved </li>
<li>Local network is not required </li>
<li>Environmentally friendly </li>
      </ul>
      <h3 className="mt-4 text-[26px] text-[#333]">
        Differences as compared to a similar multiseat software:
      </h3>
      <ul className="pl-4 mt-2 space-y-2 list-disc">
        <li>Unlike a terminal station or a thin client, excellent operation with graphic applications</li>
<li>Free trial </li>
<li>Low price </li>
<li>Compatibility with most modern video cards </li>
<li>Ideal solution for cost-effective computerization of schools, government bodies, and SOHO </li>
      </ul>

      <div className="mt-12">
        <p className="text-center">
          KEY FEATURES
        </p>
        <h1 className="text-3xl font-bold text-[#333] text-center mt-2">
          What&apos;s Unique About ASTER?
        </h1>
        <ul className="pl-4 mt-2 leading-7 list-disc">
          <li className="font-bold">
            No Additional Devices Needed
          </li>
          <p>
            In contrast to hardware-centric thin client alternatives such as NComputing, ASTER distinguishes itself as Zero Client Software, doing away with the necessity for dedicated thin client devices or hardware for each user. All that is required are monitors, mice, and keyboards for the users, and you&apos;re good to proceed!
          </p>
          <li className="font-bold">
            Not a Virtual Machine (VM)
          </li>
          <p>
            Unlike Virtual Machines (VMs), which consume significant resources and encounter difficulties on low-spec systems, ASTER operates distinctly. It doesn&apos;t operate like a VM but rather seamlessly harnesses your PC&apos;s complete power, guaranteeing smooth performance across all systems. Quite remarkable, wouldn&apos;t you agree?
          </p>
          <li className="font-bold">
            Smooth Compatibility
          </li>
          <p>
            The developers of ASTER consistently deliver software updates, ensuring an impressive 99% compatibility with the latest peripherals, including USB and Bluetooth devices, wireless video/audio adapters, graphics cards, webcams, tablets, card readers, and more. ASTER is your reliable choice for trouble-free compatibility.
          </p>
          <li className="font-bold">
            No Internet Required
          </li>
          <p>
            ASTER functions locally on your computer, without the need for an active internet connection. Whether you&apos;re online or offline, rest assured of hassle-free computing!
          </p>
          <li className="font-bold">
            Experience the World of 3D Graphics
          </li>
          <p>
            ASTIER&apos;s noteworthy feature is its direct workplace connections to the computer via monitor cables, guaranteeing native performance without any latency issues. In contrast to Thin Clients that depend on LAN connections, introducing latency through Ethernet cables, ASTER enables the smooth execution of GPU-heavy tasks. Whether you&apos;re utilizing an IGPU or a robust graphics card, ASTER ensures optimal performance, never disappointing you.
          </p>
          <li className="font-bold">
            Simple Installation Process
          </li>
          <p>
            The installation of ASTER is as straightforward as adding any typical Windows application, like MS Office, Chrome, or VLC Player—no technical expertise is required! If it doesn&apos;t meet your requirements, uninstalling is just as uncomplicated.
          </p>
        </ul>
      </div>

      <div className="mt-10">
        <h1 className="text-center text-3xl text-[#333]">
          Why Choose ASTER?
        </h1>
        <ul className="mt-2 leading-7 list-disc">
          <li className="font-bold">
            COST-EFFECTIVE With ASTER
          </li>
          <p>
            you can trim expenses by avoiding the need for additional computers, helping you stick to your budget.
          </p>
          <li className="font-bold">
            ENERGY-EFFICIENT
          </li>
          <p>
            By utilizing ASTER, you can cut down on your electricity costs by up to four times.
          </p>
          <li className="font-bold">
            USER-FRIENDLY
          </li>
          <p>
            ASTER can be easily started or unloaded at any time, just like a regular program.
          </p>
          <li className="font-bold">
            SPACE-EFFICIENT
          </li>
          <p>
            Create an additional workspace, even in a limited room, by eliminating the necessity for extra PCs.
          </p>
          <li className="font-bold">
            ENVIRONMENTALLY FRIENDLY
          </li>
          <p>
            uce future e-waste in your organization by employing fewer computers with ASTER.
          </p>
          <li className="font-bold">
            RAPID DEPLOYMENT
          </li>
          <p>
            Installing ASTER is a quick process that doesn&apos;t require disk formatting or reinstalling Windows.
          </p>
        </ul>
      </div>
    </div>
  );
}
