import React from 'react'
interface Details {
  id?: number;
  title?: string;
  description?: string;
  subPoints?: string[];
}

export default function WhatsappCrmDescription() {
    const details: Details[] = [
    {
      id: 1,
      title: "Chat Filtering",
      description:
        "Easily filter your chat list into categories like Unread, Groups, Business, Official, Awaiting Reply, Needs Reply for better organization.",
    },
    {
      id: 2,
      title: "Send WhatsApp Messages",
      description:
        "Send messages to Contacts, Numbers, Labels, Unsaved Numbers, and Groups with text and any type of attachments.",
    },
    {
      id: 3,
      title: "Message Delay Management",
      description:
        "Protect your WhatsApp account from getting banned with advanced message delay management.",
    },
    {
      id: 4,
      title: "Multiple Account Setup",
      description:
        "Add multiple WhatsApp accounts and manage them all from a single interface.",
      subPoints: [
        "Manage all accounts simultaneously.",
        "Set up auto-reply bots for each account.",
      ],
    },
    {
      id: 5,
      title: "Set Multiple Chat Bots",
      description:
        "Set up multiple chatbots on one PC to handle customer queries across all accounts.",
    },
    {
      id: 6,
      title: "Group Guard",
      description:
        "Protect multiple groups from spam activities. Safeguard all groups with robust security settings.",
    },
    {
      id: 7,
      title: "Schedule Messages",
      description:
        "Schedule messages for future delivery. Manage, edit, delete, or clone them as needed. Missed messages can also be resumed.",
    },
    {
      id: 8,
      title: "Reminders",
      description:
        "Never miss a lead by setting reminders for important follow-ups.",
    },
    {
      id: 9,
      title: "Quick Replies",
      description:
        "Save time by creating predefined answers for frequently asked questions and send them with just one click.",
    },
    {
      id: 10,
      title: "Data Extractors",
      description:
        "Extract valuable data like group members, contact lists, and chats based on labels or other criteria.",
    },
    {
      id: 11,
      title: "Group Joiner",
      description:
        "Automatically join multiple groups using bulk group links collected online. Set delays and let the software handle the rest.",
    },
    {
      id: 12,
      title: "Group Destroyer",
      description:
        "Delete inactive groups effortlessly. Remove all members and disband groups with a single click.",
    },
    {
      id: 13,
      title: "Group Management",
      description: "Identify and leave spammy or inactive groups.",
      subPoints: [
        "Extract group members’ details.",
        "Manage multiple groups easily from one dashboard.",
      ],
    },
    {
      id: 14,
      title: "Additional Tools",
      description:
        "A variety of other tools to simplify your WhatsApp operations and boost productivity.",
    },
    {
      id: 15,
      title: "Privacy Blur",
      description:
        "Blur contacts, profile pictures, chats, and group members when giving demos or recording video tutorials.",
    },
    {
      id: 16,
      title: "WhatsApp Link Generator",
      description:
        "Create links and QR codes for WhatsApp numbers, pre-filled with default messages.",
    },
    {
      id: 17,
      title: "Send Direct Messages",
      description:
        "Send messages to any number without saving it in your contacts.",
    },
    {
      id: 18,
      title: "Message Signature",
      description:
        "Add staff-specific signatures to messages when multiple staff members handle one account.",
      subPoints: [
        "Easily identify which staff member sent a specific message.",
      ],
    },
    {
      id: 19,
      title: "Message Translator",
      description:
        "Translate client messages with one click, eliminating the need to use external tools like Google Translator.",
    },
    {
      id: 20,
      title: "Proxy Support",
      description:
        "Assign distinct proxies to each account for safe and secure operations. Manage multiple accounts without risk of blocking by using separate IPs.",
    },
    {
      id: 21,
      title: "Modern Material Design",
      description:
        "Enjoy a sleek, user-friendly interface with the latest Material UI design.",
    },
    {
      id: 22,
      title: "Reports",
      description:
        "Get detailed reports after completing campaigns for better performance tracking.",
    },
  ];
  return (
    <div className='text-sm text-[#666]'>
        <p className='font-bold'>
            Make Your WhatsApp Marketing More Effective with WACRM Software
        </p>
        <h1 className='mb-3 text-2xl text-[#333] font-black'>
            Key Features:
        </h1>
        {details.map((item) => (
                  <div key={item.id} className='space-y-1'>
                    <h3 className="mt-2 mb-1 font-bold">
                      {item.id}. {item.title}
                    </h3>
                    {item.description && (
                      <p>{item.description}</p>
                    )}
                    {item.subPoints && (
                      <ul className="pl-5 mt-2 list-disc">
                        {item.subPoints.map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
    </div>
  )
}
