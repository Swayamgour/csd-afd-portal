import React, { useRef, useState } from 'react';
import { MapPin, Camera, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import { useSubmitDealerVerificationMutation, useUploadDealerRequestPhotosMutation } from './dealerRequestApi.js';
import { getErrorMessage } from '../../utils/apiError.js';
import { fileSrc } from './dealerRequestUtils.js';
import { ErrorBanner, RemarksField, ActionBox } from './ActionBits.jsx';

const MAX_PHOTOS = 10;
const MAX_MB = 5;

// URC checks the showroom on site: GPS location + photos, then submits. It does NOT create the dealer.
export default function UrcActions({ request, close }) {
  const [result, setResult] = useState('VERIFIED');
  const [remarks, setRemarks] = useState('');
  const [loc, setLoc] = useState({ lat: '', lng: '', accuracy: null, address: '' });
  const [photos, setPhotos] = useState([]); // [{ url, name, caption }]
  const [geoBusy, setGeoBusy] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef(null);

  const [upload, { isLoading: uploading }] = useUploadDealerRequestPhotosMutation();
  const [submit, { isLoading: submitting }] = useSubmitDealerVerificationMutation();

  if (request.status !== 'WITH_URC') return null;
  const verified = result === 'VERIFIED';

  const captureLocation = () => {
    setErr('');
    if (!navigator.geolocation) return setErr('This browser does not support GPS. Enter latitude and longitude manually.');
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc((l) => ({ ...l, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6), accuracy: pos.coords.accuracy }));
        setGeoBusy(false);
      },
      (e) => {
        setGeoBusy(false);
        setErr(e.code === 1 ? 'Location permission denied. Allow location access or enter the coordinates manually.' : 'Could not read your location. Try again or enter it manually.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const onPick = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setErr('');
    if (photos.length + files.length > MAX_PHOTOS) return setErr(`Maximum ${MAX_PHOTOS} photos allowed.`);
    const bad = files.find((f) => !/^image\/(jpe?g|png|webp)$/i.test(f.type) || f.size > MAX_MB * 1024 * 1024);
    if (bad) return setErr(`"${bad.name}" must be a JPG, PNG or WEBP image up to ${MAX_MB} MB.`);
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    try {
      const res = await upload(fd).unwrap();
      const list = Array.isArray(res) ? res : res?.files || [];
      setPhotos((p) => [...p, ...list.map((x) => ({ url: x.url, name: x.name, caption: '' }))]);
    } catch (er) {
      setErr(getErrorMessage(er, 'Photo upload failed.'));
    }
  };

  const run = async () => {
    setErr('');
    const lat = Number(loc.lat);
    const lng = Number(loc.lng);
    const hasLoc = loc.lat !== '' && loc.lng !== '' && Number.isFinite(lat) && Number.isFinite(lng);
    if (hasLoc && (lat < -90 || lat > 90 || lng < -180 || lng > 180)) return setErr('Latitude / longitude out of range.');
    if (verified) {
      if (!hasLoc) return setErr('Capture the showroom location (or enter latitude and longitude).');
      if (!photos.length) return setErr('Add at least one photo of the showroom.');
    } else if (remarks.trim().length < 3) {
      return setErr('Please explain why the dealer could not be verified.');
    }
    const body = {
      id: request._id,
      result,
      remarks: remarks.trim() || undefined,
      photos: photos.map((p) => ({ url: p.url, caption: p.caption?.trim() || undefined })),
    };
    if (hasLoc) body.location = { lat, lng, accuracy: loc.accuracy ?? undefined, address: loc.address.trim() || undefined };
    try {
      await submit(body).unwrap();
      close();
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  return (
    <ActionBox title="Site verification report">
      <ErrorBanner message={err} />

      <div className="row gap-2 flex-wrap" role="radiogroup" aria-label="Verification result" style={{ marginBottom: 8 }}>
        <label className="row align-center gap-1" style={{ cursor: 'pointer' }}>
          <input type="radio" name="vr" checked={verified} onChange={() => setResult('VERIFIED')} />
          <CheckCircle2 size={15} aria-hidden /> Dealer verified
        </label>
        <label className="row align-center gap-1" style={{ cursor: 'pointer' }}>
          <input type="radio" name="vr" checked={!verified} onChange={() => setResult('NOT_VERIFIED')} />
          <XCircle size={15} aria-hidden /> Could not verify
        </label>
      </div>

      <h5 style={{ margin: '10px 0 6px', fontSize: 13 }}>Showroom location {verified && <span className="req-star">*</span>}</h5>
      <div className="row gap-1 flex-wrap align-end">
        <Button size="sm" variant="outline" icon={MapPin} loading={geoBusy} onClick={captureLocation}>Capture current location</Button>
        {loc.accuracy != null && <span className="micro muted">GPS accuracy ±{Math.round(loc.accuracy)} m</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginTop: 8 }}>
        <Input id="vr-lat" label="Latitude" inputMode="decimal" value={loc.lat} onChange={(e) => setLoc((l) => ({ ...l, lat: e.target.value, accuracy: null }))} />
        <Input id="vr-lng" label="Longitude" inputMode="decimal" value={loc.lng} onChange={(e) => setLoc((l) => ({ ...l, lng: e.target.value, accuracy: null }))} />
        <Input id="vr-addr" label="Address / landmark" value={loc.address} onChange={(e) => setLoc((l) => ({ ...l, address: e.target.value }))} />
      </div>

      <h5 style={{ margin: '14px 0 6px', fontSize: 13 }}>Photos {verified && <span className="req-star">*</span>} <span className="micro muted">({photos.length}/{MAX_PHOTOS})</span></h5>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" multiple onChange={onPick} style={{ display: 'none' }} aria-label="Add photos" />
      <Button size="sm" variant="outline" icon={Camera} loading={uploading} disabled={photos.length >= MAX_PHOTOS} onClick={() => fileRef.current?.click()}>
        Take / add photo
      </Button>
      {photos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginTop: 10 }}>
          {photos.map((p, i) => (
            <div key={p.url} style={{ border: '1px solid var(--border, #d8dee6)', borderRadius: 8, overflow: 'hidden' }}>
              <img src={fileSrc(p.url)} alt={`Photo ${i + 1}`} style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: 6 }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Caption (optional)"
                  maxLength={200}
                  value={p.caption}
                  onChange={(e) => setPhotos((arr) => arr.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))}
                  aria-label={`Caption for photo ${i + 1}`}
                />
                <button type="button" className="icon-btn text-danger" style={{ marginTop: 4 }} onClick={() => setPhotos((arr) => arr.filter((_, j) => j !== i))} aria-label={`Remove photo ${i + 1}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <RemarksField id="vr-remarks" label="Remarks" required={!verified} value={remarks} onChange={setRemarks} />

      <div style={{ marginTop: 12 }}>
        <Button loading={submitting} disabled={uploading} onClick={run}>Submit verification to Admin</Button>
        <p className="micro muted" style={{ margin: '6px 0 0' }}>Submitting does not create the dealer. Admin reviews the report and creates the dealer.</p>
      </div>
    </ActionBox>
  );
}
