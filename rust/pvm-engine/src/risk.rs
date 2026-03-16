#![no_std]

pub struct RiskScore {
    pub protocol_index: usize,
    pub score_bps: u32,
}

pub fn score_protocols(yields_bps: &[u32], volatilities_bps: &[u32]) -> Vec<RiskScore> {
    yields_bps
        .iter()
        .zip(volatilities_bps.iter())
        .enumerate()
        .map(|(i, (&y, &v))| {
            let vol_factor = 10000u32 + v;
            let score = (y as u64 * 10000 / vol_factor as u64) as u32;
            RiskScore {
                protocol_index: i,
                score_bps: score,
            }
        })
        .collect()
}

pub fn compute(input: &[u8]) -> Result<Vec<u8>, ()> {
    if input.len() < 4 {
        return Err(());
    }

    let n = u32::from_le_bytes(input[0..4].try_into().map_err(|_| ())?) as usize;
    let expected_len = 4 + n * 4 * 2;
    if input.len() < expected_len {
        return Err(());
    }

    let yields: Vec<u32> = (0..n)
        .map(|i| {
            u32::from_le_bytes(
                input[4 + i * 4..8 + i * 4]
                    .try_into()
                    .unwrap_or([0, 0, 0, 0]),
            )
        })
        .collect();

    let volatilities: Vec<u32> = (0..n)
        .map(|i| {
            u32::from_le_bytes(
                input[4 + n * 4 + i * 4..8 + n * 4 + i * 4]
                    .try_into()
                    .unwrap_or([0, 0, 0, 0]),
            )
        })
        .collect();

    let scores = score_protocols(&yields, &volatilities);

    let mut output = Vec::with_capacity(n * 4);
    for score in &scores {
        output.extend_from_slice(&score.score_bps.to_le_bytes());
    }

    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_risk_adjusted_yield() {
        let yields = vec![800u32, 1400, 600];
        let volatilities = vec![500u32, 1000, 300];

        let scores = score_protocols(&yields, &volatilities);

        assert_eq!(scores.len(), 3);
        assert!(scores[0].score_bps > 0);
        assert!(scores[1].score_bps > 0);
        assert!(scores[2].score_bps > 0);
    }

    #[test]
    fn test_risk_compute() {
        let yields = vec![800u32, 1400, 600];
        let volatilities = vec![500u32, 1000, 300];

        let mut input = Vec::new();
        input.extend_from_slice(&(yields.len() as u32).to_le_bytes());

        for &y in &yields {
            input.extend_from_slice(&y.to_le_bytes());
        }
        for &v in &volatilities {
            input.extend_from_slice(&v.to_le_bytes());
        }

        let result = compute(&input);
        assert!(result.is_ok());

        let output = result.unwrap();
        assert_eq!(output.len(), 12);
    }
}
