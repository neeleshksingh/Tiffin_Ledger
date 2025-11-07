"use client"

import React, { useState, useEffect } from 'react'
import { Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react'

const notifications = [
    {
        id: 1,
        type: 'success' as const,
        title: 'Order Confirmed',
        message: 'Your tiffin order for today has been confirmed by Rajiv\'s Kitchen.',
        time: '2 hours ago',
        read: false,
    },
    {
        id: 2,
        type: 'info' as const,
        title: 'Payment Reminder',
        message: 'You have ₹240 pending for November billing. Pay now to avoid late fees.',
        time: '1 day ago',
        read: true,
    },
    {
        id: 3,
        type: 'warning' as const,
        title: 'Low Balance Alert',
        message: 'Your wallet balance is low. Top up to continue seamless ordering.',
        time: '3 days ago',
        read: false,
    },
    {
        id: 4,
        type: 'success' as const,
        title: 'New Menu Update',
        message: 'Exciting new veggie options added to the menu starting next week!',
        time: '5 days ago',
        read: true,
    },
    {
        id: 5,
        type: 'error' as const,
        title: 'Delivery Delay',
        message: 'Sorry for the inconvenience—your dinner delivery is delayed by 30 mins due to traffic.',
        time: '1 week ago',
        read: false,
    },
    {
        id: 6,
        type: 'info' as const,
        title: 'Vendor Rating',
        message: 'Rate your last tiffin experience to help us improve service.',
        time: '2 weeks ago',
        read: true,
    },
]

const getIcon = (type: string) => {
    switch (type) {
        case 'success': return <CheckCircle className="h-5 w-5" />
        case 'info': return <Info className="h-5 w-5" />
        case 'warning': return <AlertTriangle className="h-5 w-5" />
        case 'error': return <X className="h-5 w-5" />
        default: return <Bell className="h-5 w-5" />
    }
}

const getBgColor = (type: string) => {
    switch (type) {
        case 'success': return 'bg-green-50 border-green-200 text-green-800'
        case 'info': return 'bg-blue-50 border-blue-200 text-blue-800'
        case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
        case 'error': return 'bg-red-50 border-red-200 text-red-800'
        default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
}

function NotificationsPage() {
    const unreadCount = notifications.filter(n => !n.read).length
    const [lastSync, setLastSync] = useState('Loading...')

    useEffect(() => {
        setLastSync(new Date().toLocaleString())
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-600 rounded-xl shadow-lg">
                            <Bell className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Notifications
                            </h1>
                            {unreadCount > 0 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    {unreadCount} unread
                                </span>
                            )}
                        </div>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
                        Mark all as read
                    </button>
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`group cursor-pointer transform hover:scale-[1.02] transition-all duration-200 ease-out rounded-2xl p-6 border-l-4 shadow-md ${getBgColor(notification.type)
                                    } ${!notification.read ? 'ring-2 ring-blue-200 shadow-lg' : 'shadow-sm'}`}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className={`flex-shrink-0 p-2 rounded-lg bg-white shadow-sm ${notification.type === 'success' ? 'bg-green-50' :
                                        notification.type === 'info' ? 'bg-blue-50' :
                                            notification.type === 'warning' ? 'bg-yellow-50' :
                                                'bg-red-50'
                                        }`}>
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {notification.title}
                                            </h3>
                                            <span className={`text-xs ${!notification.read ? 'text-gray-500 font-medium' : 'text-gray-400'}`}>
                                                {notification.time}
                                            </span>
                                        </div>
                                        <p className={`text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                                            {notification.message}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="flex-shrink-0 ml-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                            <p className="text-gray-500">Stay tuned for updates on your orders and payments.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-sm text-gray-500">
                    <p>Notifications are updated in real-time. Last sync: {lastSync}</p>
                </div>
            </div>
        </div>
    )
}

export default NotificationsPage;