
CREATE OR REPLACE FUNCTION public.get_patient_status_by_token(_journey_id uuid, _token uuid)
RETURNS json
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'journey', row_to_json(pj),
    'patient', json_build_object('name', p.name, 'mrn', p.mrn),
    'events', COALESCE((
      SELECT json_agg(row_to_json(je) ORDER BY je.event_time DESC)
      FROM journey_events je WHERE je.journey_id = pj.id
    ), '[]'::json)
  ) INTO result
  FROM patient_journeys pj
  LEFT JOIN patients p ON p.id = pj.patient_id
  WHERE pj.id = _journey_id AND pj.access_token = _token;
  
  RETURN result;
END;
$$;
