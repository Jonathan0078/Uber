
import requests
from typing import Optional, Dict, List

class NominatimGeocodingService:
    """Serviço de geocodificação usando OpenStreetMap Nominatim"""
    
    def __init__(self, user_agent: str = "uber-app/1.0"):
        self.base_url = "https://nominatim.openstreetmap.org"
        self.user_agent = user_agent
        self.headers = {
            'User-Agent': self.user_agent
        }
    
    def geocode_address(self, address: str) -> Optional[Dict]:
        """
        Converte endereço em coordenadas
        
        Args:
            address: Endereço para geocodificar
            
        Returns:
            Dicionário com coordenadas ou None se não encontrado
        """
        try:
            params = {
                'q': address,
                'format': 'json',
                'addressdetails': 1,
                'limit': 1
            }
            
            response = requests.get(
                f"{self.base_url}/search",
                params=params,
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            
            if data and len(data) > 0:
                result = data[0]
                return {
                    'latitude': float(result['lat']),
                    'longitude': float(result['lon']),
                    'display_name': result['display_name'],
                    'address': result.get('address', {}),
                    'importance': result.get('importance', 0)
                }
            
            return None
            
        except requests.RequestException as e:
            print(f"Erro na geocodificação: {e}")
            return None
        except Exception as e:
            print(f"Erro inesperado na geocodificação: {e}")
            return None
    
    def reverse_geocode(self, latitude: float, longitude: float) -> Optional[Dict]:
        """
        Converte coordenadas em endereço
        
        Args:
            latitude: Latitude
            longitude: Longitude
            
        Returns:
            Dicionário com endereço ou None se não encontrado
        """
        try:
            params = {
                'lat': latitude,
                'lon': longitude,
                'format': 'json',
                'addressdetails': 1
            }
            
            response = requests.get(
                f"{self.base_url}/reverse",
                params=params,
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            
            if 'display_name' in data:
                return {
                    'display_name': data['display_name'],
                    'address': data.get('address', {}),
                    'latitude': latitude,
                    'longitude': longitude
                }
            
            return None
            
        except requests.RequestException as e:
            print(f"Erro na geocodificação reversa: {e}")
            return None
        except Exception as e:
            print(f"Erro inesperado na geocodificação reversa: {e}")
            return None
    
    def search_nearby(self, latitude: float, longitude: float, 
                     query: str, radius: int = 1000) -> List[Dict]:
        """
        Busca pontos de interesse próximos
        
        Args:
            latitude: Latitude central
            longitude: Longitude central
            query: Termo de busca (ex: "hospital", "posto de gasolina")
            radius: Raio de busca em metros
            
        Returns:
            Lista de pontos encontrados
        """
        try:
            # Calcular boundingbox aproximado
            lat_offset = radius / 111320  # 1 grau lat ≈ 111320 metros
            lon_offset = radius / (111320 * abs(latitude))
            
            viewbox = f"{longitude - lon_offset},{latitude + lat_offset},{longitude + lon_offset},{latitude - lat_offset}"
            
            params = {
                'q': query,
                'format': 'json',
                'addressdetails': 1,
                'limit': 10,
                'viewbox': viewbox,
                'bounded': 1
            }
            
            response = requests.get(
                f"{self.base_url}/search",
                params=params,
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            
            results = []
            for item in data:
                results.append({
                    'latitude': float(item['lat']),
                    'longitude': float(item['lon']),
                    'display_name': item['display_name'],
                    'address': item.get('address', {}),
                    'importance': item.get('importance', 0)
                })
            
            return results
            
        except requests.RequestException as e:
            print(f"Erro na busca nearby: {e}")
            return []
        except Exception as e:
            print(f"Erro inesperado na busca nearby: {e}")
            return []
