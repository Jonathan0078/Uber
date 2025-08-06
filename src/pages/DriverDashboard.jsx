import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogOut, Car, MapPin, Clock, Star, DollarSign, Send, CheckCircle } from 'lucide-react'
import { rideRequestService, driverService } from '../services/firestoreService'

export default function DriverDashboard({ onLogout }) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [rideRequests, setRideRequests] = useState([]);
  const [currentRide, setCurrentRide] = useState(null);
  const [earnings, setEarnings] = useState(0);
  const [proposedPrices, setProposedPrices] = useState({});
  const [driver, setDriver] = useState(null);
