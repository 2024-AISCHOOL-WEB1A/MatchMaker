const express = require('express')
const router = express.Router()
const conn = require('../config/DB')


// 밸런스 매칭
// 점수 배열을 입력받아 5명의 팀을 구성하는 모든 조합을 반환
function getCombinations(arr, size) {
    if (size > arr.length) return [];
    if (size === arr.length) return [arr];
    if (size === 1) return arr.map(el => [el]);

    const combinations = [];
    arr.forEach((el, idx) => {
        const smallerCombinations = getCombinations(arr.slice(idx + 1), size - 1);
        smallerCombinations.forEach(comb => {
            combinations.push([el, ...comb]);
        });
    });

    return combinations;
}

// 주어진 팀을 제외한 나머지 팀 반환
function getRemainingTeam(fullTeam, selectedTeam) {
    return fullTeam.filter(player => !selectedTeam.includes(player));
}

// 평균 계산 함수
function calculateAverage(arr) {
    const sum = arr.reduce((acc, val) => acc + val, 0);
    return sum / arr.length;
}

// 점수 배열을 기반으로 최적의 팀 구성 반환
function findBestTeams(scores) {
    const players = Array.from({ length: scores.length }, (_, i) => i);
    const allCombinations = getCombinations(players, 5);

    let bestTeams = null;
    let smallestDifference = Infinity;

    allCombinations.forEach(teamA => {
        const teamB = getRemainingTeam(players, teamA);
        const avgA = calculateAverage(teamA.map(player => scores[player]));
        const avgB = calculateAverage(teamB.map(player => scores[player]));
        const difference = Math.abs(avgA - avgB);

        if (difference < smallestDifference) {
            smallestDifference = difference;
            bestTeams = { teamA, teamB, avgA, avgB };
        }
    });

    return bestTeams;
}

// 밸런스 매칭 기능 실행
router.post("/tmmatch", (req, res) => {
    console.log("tmmatch", req.body);
    console.log(req.body.rate);
    // 테스트용 점수 배열
    let rates = req.body.rate


    let bestTeams = findBestTeams(rates);

    console.log(bestTeams.teamA.map(player => `Player ${player + 1}`));

    console.log('팀 A:', bestTeams.teamA.map(player => `Player ${player + 1}`), '평균 점수:', bestTeams.avgA);
    console.log('팀 B:', bestTeams.teamB.map(player => `Player ${player + 1}`), '평균 점수:', bestTeams.avgB);

    res.render('bal_rate_tmmatch', {
        teamA: bestTeams.teamA.map(player => `Player ${player + 1}`).join(', '),
        teamB: bestTeams.teamB.map(player => `Player ${player + 1}`).join(', ')
    });

});

module.exports = router;