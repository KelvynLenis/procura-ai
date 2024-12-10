
import 'leaflet/dist/leaflet.css';
import * as ReactLeaflet from 'react-leaflet';
import { useEffect } from 'react';
import Leaflet from 'leaflet';
// import { Marker, Popup, TileLayer } from "react-leaflet";
import { LatLng } from 'leaflet';

const { MapContainer } = ReactLeaflet;
function Map({ children, width, height, ...rest }) {

  const position: LatLng = new LatLng(51.505, -0.09);

  useEffect(() => {
    (async function init() {
      delete Leaflet.Icon.Default.prototype._getIconUrl;
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'leaflet/images/marker-icon-2x.png',
        iconUrl: 'leaflet/images/marker-icon.png',
        shadowUrl: 'leaflet/images/marker-shadow.png',
      });
    })();
  }, []);

  return (
    <MapContainer {...rest}>
      {children}
    </MapContainer>
  )
}

export default Map;