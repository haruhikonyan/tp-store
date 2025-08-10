class TrumpetShopGame {
    constructor() {
        this.money = 1000;
        this.reputation = 50;
        this.level = 1;
        this.completed = 0;
        this.currentOrder = null;
        this.currentTrumpet = null;
        this.musicGameActive = false;
        this.targetSequence = [];
        this.playerSequence = [];

        this.materials = {
            brass: { name: '真鍮', count: 3, price: 100, quality: 1 },
            silver: { name: '銀', count: 1, price: 300, quality: 2 },
            gold: { name: '金', count: 0, price: 800, quality: 3 },
            leather: { name: '革', count: 2, price: 50, quality: 1 },
            velvet: { name: 'ベルベット', count: 1, price: 200, quality: 2 }
        };

        this.orders = [];
        this.generateInitialOrders();

        // 音楽システムを初期化
        this.audioSystem = new AudioSystem();

        this.init();
    }

    init() {
        this.updateDisplay();
        this.bindEvents();
        this.renderOrders();
        this.renderMaterials();

        // 初回訪問時にチュートリアルを表示
        if (!localStorage.getItem('trumpet-tutorial-completed')) {
            setTimeout(() => this.showTutorial(), 1000);
        }

        // デバッグモードを有効にする（開発時用）
        // URLに?debug=trueが含まれている場合、またはコンソールで trumpet.showDebug() を実行した場合
        if (window.location.search.includes('debug=true')) {
            this.enableDebugMode();
        }

        // グローバルにアクセス可能にしてデバッグを有効化
        window.trumpet = this;
    }

    enableDebugMode() {
        document.getElementById('debug-btn').style.display = 'inline-block';
        console.log('デバッグモードが有効になりました');
        console.log('trumpet.showDebugPanel() でデバッグパネルを表示できます');
    }

    bindEvents() {
        // 製作開始ボタンのイベントリスナー
        const startCraftingBtn = document.getElementById('start-crafting');
        if (startCraftingBtn) {
            startCraftingBtn.addEventListener('click', (e) => {
                console.log('製作開始ボタンがクリックされました');
                this.startCrafting();
            });
        } else {
            console.error('start-crafting ボタンが見つかりません');
        }

        document.getElementById('start-tuning').addEventListener('click', () => this.startMusicGame());
        document.getElementById('complete-trumpet').addEventListener('click', () => this.completeTrumpet());
        document.getElementById('generate-order').addEventListener('click', () => this.generateNewOrder());
        document.getElementById('buy-materials').addEventListener('click', () => this.buyMaterials());

        // チュートリアル関連
        document.getElementById('help-btn').addEventListener('click', () => this.showTutorial());
        document.getElementById('close-tutorial').addEventListener('click', () => this.hideTutorial());
        document.getElementById('prev-step').addEventListener('click', () => this.prevTutorialStep());
        document.getElementById('next-step').addEventListener('click', () => this.nextTutorialStep());
        document.getElementById('start-game').addEventListener('click', () => this.startTutorialGame());

        // デバッグ関連
        document.getElementById('debug-btn').addEventListener('click', () => this.showDebugPanel());
        document.getElementById('close-debug').addEventListener('click', () => this.hideDebugPanel());

        // 音符クリックイベント
        document.querySelectorAll('.note').forEach(note => {
            note.addEventListener('click', (e) => this.playNote(e.target.dataset.note));
        });

        // 音量調整
        const volumeSlider = document.getElementById('volume-slider');
        const volumeDisplay = document.getElementById('volume-display');
        if (volumeSlider && volumeDisplay) {
            volumeSlider.addEventListener('input', (e) => {
                const volume = e.target.value;
                volumeDisplay.textContent = volume + '%';
                if (this.audioSystem) {
                    this.audioSystem.setMasterVolume(volume / 100);
                }
            });
        }

        // デバッグモードの有効化（コンソールでエラーが出た場合）
        window.addEventListener('error', () => {
            document.getElementById('debug-btn').style.display = 'inline-block';
        });
    }

    updateDisplay() {
        document.getElementById('money').textContent = this.money;
        document.getElementById('reputation').textContent = this.reputation;
        document.getElementById('level').textContent = this.level;
        document.getElementById('completed').textContent = this.completed;

        // ボタンの状態も更新
        this.updateCraftingButtonState();
    }

    generateInitialOrders() {
        const orderTypes = [
            { name: '学生用トランペット', difficulty: 1, reward: 300, description: '音楽学校の学生用' },
            { name: 'プロ演奏家用トランペット', difficulty: 2, reward: 800, description: 'プロの演奏家が使用' },
            { name: 'オーケストラ用トランペット', difficulty: 3, reward: 1500, description: 'オーケストラの特別公演用' },
            { name: 'ジャズクラブ用トランペット', difficulty: 2, reward: 600, description: 'ジャズクラブでの演奏用' }
        ];

        for (let i = 0; i < 3; i++) {
            const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
            this.orders.push({
                id: Date.now() + i,
                ...orderType,
                deadline: Math.floor(Math.random() * 5) + 3
            });
        }
    }

    generateNewOrder() {
        const orderTypes = [
            { name: '学生用トランペット', difficulty: 1, reward: 300, description: '音楽学校の学生用' },
            { name: 'プロ演奏家用トランペット', difficulty: 2, reward: 800, description: 'プロの演奏家が使用' },
            { name: 'オーケストラ用トランペット', difficulty: 3, reward: 1500, description: 'オーケストラの特別公演用' },
            { name: 'ジャズクラブ用トランペット', difficulty: 2, reward: 600, description: 'ジャズクラブでの演奏用' },
            { name: 'マーチングバンド用トランペット', difficulty: 2, reward: 700, description: 'マーチングバンド用の丈夫なもの' },
            { name: 'コンクール用トランペット', difficulty: 3, reward: 1200, description: 'コンクールで使用する高品質なもの' }
        ];

        const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
        const newOrder = {
            id: Date.now(),
            ...orderType,
            deadline: Math.floor(Math.random() * 5) + 3
        };

        this.orders.push(newOrder);
        this.renderOrders();
        this.showNotification('新しい注文が入りました！', 'success');
    }

    renderOrders() {
        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = '';

        this.orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'order-item';
            if (this.currentOrder && this.currentOrder.id === order.id) {
                orderElement.classList.add('selected');
            }

            orderElement.innerHTML = `
                <h4>${order.name}</h4>
                <p>${order.description}</p>
                <p>💰 報酬: ${order.reward}円</p>
                <p>⏰ 難易度: ${'⭐'.repeat(order.difficulty)}</p>
                <p>📅 期限: ${order.deadline}日</p>
            `;

            orderElement.addEventListener('click', () => this.selectOrder(order));
            ordersList.appendChild(orderElement);
        });
    }

    selectOrder(order) {
        this.currentOrder = order;
        this.renderOrders();
        this.updateCraftingButtonState(); // ボタン状態を更新
        this.showNotification(`${order.name}を選択しました`, 'success');
    }

    renderMaterials() {
        const materialsGrid = document.getElementById('materials-grid');
        materialsGrid.innerHTML = '';

        Object.entries(this.materials).forEach(([key, material]) => {
            const materialElement = document.createElement('div');
            materialElement.className = 'material-item';
            materialElement.innerHTML = `
                <h4>${material.name}</h4>
                <p>在庫: ${material.count}</p>
                <p>品質: ${'⭐'.repeat(material.quality)}</p>
                <p>💰 ${material.price}円</p>
            `;
            materialsGrid.appendChild(materialElement);
        });

        // 材料が変更されたらボタン状態を更新
        this.updateCraftingButtonState();
    }

    startCrafting() {
        console.log('startCrafting メソッドが呼ばれました');
        console.log('現在の注文:', this.currentOrder);
        console.log('現在のトランペット:', this.currentTrumpet);

        // 既に製作中かチェック
        if (this.currentTrumpet) {
            this.showNotification('❗ 既に製作中です', 'error');
            console.log('既に製作中のため中断');
            return;
        }

        if (!this.currentOrder) {
            this.showNotification('❗ まず注文を選択してください', 'error');
            this.highlightElement('.orders', '注文をクリックして選択してください');
            console.log('注文が選択されていません');
            return;
        }

        // 材料チェック
        const requiredMaterials = this.getRequiredMaterials(this.currentOrder.difficulty);
        console.log('必要な材料:', requiredMaterials);
        console.log('現在の材料:', this.materials);

        if (!this.checkMaterials(requiredMaterials)) {
            this.showNotification('❗ 材料が不足しています', 'error');
            this.showRequiredMaterials(requiredMaterials);
            console.log('材料が不足しています');
            return;
        }

        // 材料消費
        this.consumeMaterials(requiredMaterials);
        console.log('材料を消費しました');

        this.currentTrumpet = {
            quality: 1,
            progress: 0,
            order: this.currentOrder
        };

        // UI状態更新
        const workshop = document.querySelector('.workshop');
        if (workshop) {
            workshop.setAttribute('data-state', 'crafting');
        }

        const musicGame = document.getElementById('music-game');
        const startCraftingBtn = document.getElementById('start-crafting');

        if (musicGame) {
            musicGame.style.display = 'block';
            console.log('音楽ゲームを表示しました');
        }

        if (startCraftingBtn) {
            startCraftingBtn.style.display = 'none';
            console.log('製作開始ボタンを非表示にしました');
        }

        this.showNotification('🔨 製作を開始しました！', 'success');
        this.renderMaterials();
        this.updateCraftingButtonState();
        console.log('製作開始完了');
    }

    showRequiredMaterials(required) {
        const materialNames = {
            brass: '真鍮',
            silver: '銀',
            gold: '金',
            leather: '革',
            velvet: 'ベルベット'
        };

        const missing = [];
        Object.entries(required).forEach(([material, count]) => {
            if (this.materials[material].count < count) {
                missing.push(`${materialNames[material]} (${count}個必要)`);
            }
        });

        this.showNotification(`不足材料: ${missing.join(', ')}`, 'error');
    }

    getRequiredMaterials(difficulty) {
        const materials = { brass: 1, leather: 1 };
        if (difficulty >= 2) {
            materials.silver = 1;
        }
        if (difficulty >= 3) {
            materials.gold = 1;
            materials.velvet = 1;
        }
        return materials;
    }

    checkMaterials(required) {
        return Object.entries(required).every(([material, count]) =>
            this.materials[material].count >= count
        );
    }

    consumeMaterials(required) {
        Object.entries(required).forEach(([material, count]) => {
            this.materials[material].count -= count;
        });
    }

    showNotification(message, type) {
        const notification = document.getElementById('notification');
        if (!notification) {
            console.warn('通知要素が見つかりません:', message);
            return;
        }

        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    highlightElement(selector, message = '') {
        const element = document.querySelector(selector);
        if (!element) return;

        element.style.animation = 'attention 1s ease-in-out 3';
        setTimeout(() => {
            element.style.animation = '';
        }, 3000);
    }

    startMusicGame() {
        if (!this.currentTrumpet) {
            this.showNotification('❗ 先に製作を開始してください', 'error');
            return;
        }

        this.musicGameActive = true;
        this.generateTargetSequence();
        this.playerSequence = [];

        // 音符をリセット
        document.querySelectorAll('.note').forEach(note => {
            note.className = 'note';
        });

        document.getElementById('start-tuning').style.display = 'none';
        this.showTargetSequence();
    }

    generateTargetSequence() {
        const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const length = Math.min(3 + this.currentOrder.difficulty, 7);
        this.targetSequence = [];

        for (let i = 0; i < length; i++) {
            this.targetSequence.push(notes[Math.floor(Math.random() * notes.length)]);
        }
    }

    showTargetSequence() {
        const display = document.getElementById('sequence-display');
        if (display) {
            display.innerHTML = `
                <p>この順序で演奏してください: ${this.targetSequence.join(' → ')}</p>
                <button class="btn" id="play-demo" style="margin-top: 10px;">🔊 お手本を聞く</button>
            `;

            // お手本再生ボタンのイベントリスナー
            const playDemoBtn = document.getElementById('play-demo');
            if (playDemoBtn) {
                playDemoBtn.addEventListener('click', () => {
                    if (this.audioSystem) {
                        this.audioSystem.playSequence(this.targetSequence, 0.6, 0.2);
                    }
                });
            }
        }
    }

    playNote(note) {
        if (!this.musicGameActive) return;

        // 音を鳴らす
        if (this.audioSystem) {
            this.audioSystem.playNote(note, 0.5);
        }

        this.playerSequence.push(note);
        const noteElement = document.querySelector(`[data-note="${note}"]`);

        // 正解かチェック
        const currentIndex = this.playerSequence.length - 1;
        if (this.playerSequence[currentIndex] === this.targetSequence[currentIndex]) {
            noteElement.classList.add('correct');

            // 全部正解した場合
            if (this.playerSequence.length === this.targetSequence.length) {
                this.completeMusicGame(true);
            }
        } else {
            noteElement.classList.add('wrong');
            setTimeout(() => {
                this.completeMusicGame(false);
            }, 1000);
        }

        // プログレスバー更新
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            const progress = (this.playerSequence.length / this.targetSequence.length) * 100;
            progressFill.style.width = progress + '%';
        }
    }

    completeMusicGame(success) {
        this.musicGameActive = false;

        if (success) {
            // 成功音を鳴らす
            if (this.audioSystem) {
                this.audioSystem.playSuccessSound();
            }

            this.currentTrumpet.quality++;
            this.currentTrumpet.progress += 33;
            this.showNotification('🎉 素晴らしい演奏です！品質が向上しました！', 'success');
        } else {
            // エラー音を鳴らす
            if (this.audioSystem) {
                this.audioSystem.playErrorSound();
            }

            this.currentTrumpet.progress += 10;
            this.showNotification('📝 もう一度挑戦してみましょう', 'error');
        }

        // 進行度表示更新
        const attempts = Math.floor(this.currentTrumpet.progress / 33);
        const progressText = document.getElementById('progress-text');
        if (progressText) {
            progressText.textContent = `${attempts}/3`;
        }

        // 品質表示更新
        const qualityNames = ['', '普通', '良い', '優秀', '最高級'];
        const qualityValue = document.getElementById('quality-value');
        if (qualityValue) {
            qualityValue.textContent = qualityNames[this.currentTrumpet.quality] || '普通';
        }

        // プログレスバーリセット
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            progressFill.style.width = '0%';
        }

        // 音符リセット
        setTimeout(() => {
            document.querySelectorAll('.note').forEach(note => {
                note.className = 'note';
            });
        }, 1000);

        document.getElementById('start-tuning').style.display = 'inline-block';

        // 完成チェック
        if (this.currentTrumpet.progress >= 100) {
            const completeBtn = document.getElementById('complete-trumpet');
            const tuningBtn = document.getElementById('start-tuning');
            const workshop = document.querySelector('.workshop');

            if (completeBtn) completeBtn.style.display = 'inline-block';
            if (tuningBtn) tuningBtn.style.display = 'none';
            if (workshop) workshop.setAttribute('data-state', 'ready');

            this.showNotification('✨ トランペットが完成しました！納品できます', 'success');
        }
    }

    completeTrumpet() {
        if (!this.currentTrumpet) {
            this.showNotification('❗ 完成させるトランペットがありません', 'error');
            return;
        }

        const baseReward = this.currentOrder.reward;
        const qualityBonus = (this.currentTrumpet.quality - 1) * 0.2;
        const finalReward = Math.floor(baseReward * (1 + qualityBonus));

        this.money += finalReward;
        this.reputation += this.currentTrumpet.quality * 5;
        this.completed++;

        // レベルアップチェック
        const newLevel = Math.floor(this.completed / 3) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;

            // レベルアップ音を鳴らす
            if (this.audioSystem) {
                this.audioSystem.playLevelUpSound();
            }

            this.showNotification(`レベルアップ！ レベル${this.level}になりました！`, 'success');
        }

        this.showNotification(`${this.currentOrder.name}が完成！ ${finalReward}円獲得！`, 'success');

        // 注文リストから削除
        this.orders = this.orders.filter(order => order.id !== this.currentOrder.id);

        // リセット
        this.currentOrder = null;
        this.currentTrumpet = null;

        const elements = {
            musicGame: document.getElementById('music-game'),
            startCrafting: document.getElementById('start-crafting'),
            completeTrumpet: document.getElementById('complete-trumpet'),
            qualityValue: document.getElementById('quality-value'),
            progressText: document.getElementById('progress-text'),
            workshop: document.querySelector('.workshop')
        };

        if (elements.musicGame) elements.musicGame.style.display = 'none';
        if (elements.startCrafting) elements.startCrafting.style.display = 'inline-block';
        if (elements.completeTrumpet) elements.completeTrumpet.style.display = 'none';
        if (elements.qualityValue) elements.qualityValue.textContent = '普通';
        if (elements.progressText) elements.progressText.textContent = '0/3';
        if (elements.workshop) elements.workshop.setAttribute('data-state', 'idle');

        this.updateDisplay();
        this.renderOrders();
    }

    buyMaterials() {
        // 簡単な材料購入システム
        const materialTypes = Object.keys(this.materials);
        const randomMaterial = materialTypes[Math.floor(Math.random() * materialTypes.length)];
        const material = this.materials[randomMaterial];

        if (this.money >= material.price) {
            this.money -= material.price;
            material.count++;
            this.showNotification(`${material.name}を購入しました！`, 'success');
            this.updateDisplay();
            this.renderMaterials();
        } else {
            this.showNotification('お金が足りません', 'error');
        }
    }

    // ボタンの状態を更新する関数
    updateCraftingButtonState() {
        const startCraftingBtn = document.getElementById('start-crafting');
        if (!startCraftingBtn) return;

        let buttonText = '🔨 製作開始';
        let isDisabled = false;
        let tooltipText = '';

        if (this.currentTrumpet) {
            buttonText = '🔨 製作中...';
            isDisabled = true;
            tooltipText = '既に製作中です';
        } else if (!this.currentOrder) {
            buttonText = '🔨 製作開始 (注文を選択)';
            tooltipText = 'まず注文を選択してください';
        } else {
            const requiredMaterials = this.getRequiredMaterials(this.currentOrder.difficulty);
            if (!this.checkMaterials(requiredMaterials)) {
                buttonText = '🔨 製作開始 (材料不足)';
                tooltipText = '必要な材料が不足しています';

                // 足りない材料を表示
                const materialNames = {
                    brass: '真鍮', silver: '銀', gold: '金',
                    leather: '革', velvet: 'ベルベット'
                };
                const missing = [];
                Object.entries(requiredMaterials).forEach(([material, count]) => {
                    if (this.materials[material].count < count) {
                        missing.push(`${materialNames[material]}(${count}個)`);
                    }
                });
                tooltipText += `\n不足: ${missing.join(', ')}`;
            } else {
                buttonText = '🔨 製作開始';
                tooltipText = 'クリックして製作を開始';
            }
        }

        startCraftingBtn.textContent = buttonText;
        startCraftingBtn.disabled = isDisabled;
        startCraftingBtn.title = tooltipText;

        // ボタンのクラスを更新
        startCraftingBtn.className = 'btn';
        if (isDisabled) {
            startCraftingBtn.classList.add('disabled');
        } else if (!this.currentOrder) {
            startCraftingBtn.classList.add('warning');
        } else if (this.currentOrder && !this.checkMaterials(this.getRequiredMaterials(this.currentOrder.difficulty))) {
            startCraftingBtn.classList.add('warning');
        } else {
            startCraftingBtn.classList.add('primary');
        }
    }

    // デバッグパネル表示
    showDebugPanel() {
        const debugInfo = this.getDebugInfo();
        document.getElementById('debug-info').textContent = debugInfo;
        document.getElementById('debug-panel').style.display = 'flex';
    }

    hideDebugPanel() {
        document.getElementById('debug-panel').style.display = 'none';
    }

    getDebugInfo() {
        const requiredMaterials = this.currentOrder ? this.getRequiredMaterials(this.currentOrder.difficulty) : {};

        return `=== ゲーム状態デバッグ情報 ===

現在の注文: ${this.currentOrder ? this.currentOrder.name : 'なし'}
注文の難易度: ${this.currentOrder ? this.currentOrder.difficulty : 'なし'}
製作中のトランペット: ${this.currentTrumpet ? 'あり' : 'なし'}

=== 材料状況 ===
真鍮: ${this.materials.brass.count}個 (必要: ${requiredMaterials.brass || 0}個)
銀: ${this.materials.silver.count}個 (必要: ${requiredMaterials.silver || 0}個)
金: ${this.materials.gold.count}個 (必要: ${requiredMaterials.gold || 0}個)
革: ${this.materials.leather.count}個 (必要: ${requiredMaterials.leather || 0}個)
ベルベット: ${this.materials.velvet.count}個 (必要: ${requiredMaterials.velvet || 0}個)

=== ボタン状態 ===
製作開始ボタン要素: ${document.getElementById('start-crafting') ? '存在する' : '存在しない'}
ボタンのdisabled状態: ${document.getElementById('start-crafting')?.disabled || false}
ボタンの表示状態: ${document.getElementById('start-crafting')?.style.display || 'デフォルト'}

=== エラーチェック ===
注文選択済み: ${!!this.currentOrder}
材料十分: ${this.currentOrder ? this.checkMaterials(requiredMaterials) : '注文なし'}
製作中でない: ${!this.currentTrumpet}

=== その他 ===
所持金: ${this.money}円
評判: ${this.reputation}
レベル: ${this.level}
完成数: ${this.completed}`;
    }
}

// 音楽システムクラス
class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.gainNode = null;
        this.initialized = false;

        // 音階の周波数マッピング（C4から始まる1オクターブ）
        this.noteFrequencies = {
            'C': 261.63,  // ド
            'D': 293.66,  // レ
            'E': 329.63,  // ミ
            'F': 349.23,  // ファ
            'G': 392.00,  // ソ
            'A': 440.00,  // ラ
            'B': 493.88   // シ
        };

        this.initAudio();
    }

    async initAudio() {
        try {
            // AudioContextの初期化
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // マスターボリューム用のGainNode
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);

            this.initialized = true;
            console.log('音楽システムが初期化されました');
        } catch (error) {
            console.warn('音楽システムの初期化に失敗しました:', error);
        }
    }

    async resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    playNote(note, duration = 0.5, volume = 0.3) {
        if (!this.initialized || !this.audioContext) {
            console.warn('音楽システムが初期化されていません');
            return;
        }

        // ユーザー操作後にAudioContextを再開
        this.resumeAudioContext();

        const frequency = this.noteFrequencies[note];
        if (!frequency) {
            console.warn(`未知の音符: ${note}`);
            return;
        }

        const currentTime = this.audioContext.currentTime;

        // オシレーター（音の波形生成）
        const oscillator = this.audioContext.createOscillator();
        const noteGain = this.audioContext.createGain();

        // トランペットっぽい音色を作る
        oscillator.type = 'sawtooth'; // ブラス系の音色
        oscillator.frequency.setValueAtTime(frequency, currentTime);

        // 音量エンベロープ（アタック・ディケイ・サスティン・リリース）
        noteGain.gain.setValueAtTime(0, currentTime);
        noteGain.gain.linearRampToValueAtTime(volume, currentTime + 0.05); // アタック
        noteGain.gain.exponentialRampToValueAtTime(volume * 0.8, currentTime + 0.1); // ディケイ
        noteGain.gain.setValueAtTime(volume * 0.8, currentTime + duration - 0.1); // サスティン
        noteGain.gain.exponentialRampToValueAtTime(0.01, currentTime + duration); // リリース

        // フィルター（高音をカットしてよりリアルに）
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, currentTime);
        filter.Q.setValueAtTime(1, currentTime);

        // 接続
        oscillator.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.gainNode);

        // 再生
        oscillator.start(currentTime);
        oscillator.stop(currentTime + duration);

        return oscillator;
    }

    playSequence(notes, noteDuration = 0.6, gap = 0.1) {
        if (!notes || notes.length === 0) return;

        notes.forEach((note, index) => {
            const startTime = index * (noteDuration + gap);
            setTimeout(() => {
                this.playNote(note, noteDuration);
            }, startTime * 1000);
        });
    }

    playChord(notes, duration = 1.0) {
        notes.forEach(note => {
            this.playNote(note, duration, 0.2); // コードは音量を下げる
        });
    }

    playSuccessSound() {
        // 成功時の和音
        this.playChord(['C', 'E', 'G'], 0.8);
    }

    playErrorSound() {
        // エラー時の不協和音
        setTimeout(() => this.playNote('F', 0.2, 0.2), 0);
        setTimeout(() => this.playNote('B', 0.2, 0.2), 100);
    }

    playLevelUpSound() {
        // レベルアップ時のファンファーレ
        const melody = ['C', 'E', 'G', 'C'];
        this.playSequence(melody, 0.3, 0.1);
    }

    setMasterVolume(volume) {
        if (this.gainNode) {
            this.gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        }
    }
}

// チュートリアル機能を追加
class TutorialManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
    }

    showTutorial() {
        document.getElementById('tutorial-modal').classList.add('show');
        this.currentStep = 1;
        this.updateTutorialStep();
    }

    hideTutorial() {
        document.getElementById('tutorial-modal').classList.remove('show');
        localStorage.setItem('trumpet-tutorial-completed', 'true');
    }

    nextTutorialStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateTutorialStep();
        }
    }

    prevTutorialStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateTutorialStep();
        }
    }

    updateTutorialStep() {
        // 全てのステップを非表示
        document.querySelectorAll('.tutorial-step').forEach(step => {
            step.classList.remove('active');
        });

        // 現在のステップを表示
        document.querySelector(`[data-step="${this.currentStep}"]`).classList.add('active');

        // ステップインジケーター更新
        document.getElementById('step-indicator').textContent = `${this.currentStep} / ${this.totalSteps}`;

        // ナビゲーションボタンの表示制御
        const prevBtn = document.getElementById('prev-step');
        const nextBtn = document.getElementById('next-step');
        const startBtn = document.getElementById('start-game');

        prevBtn.style.display = this.currentStep === 1 ? 'none' : 'inline-block';
        nextBtn.style.display = this.currentStep === this.totalSteps ? 'none' : 'inline-block';
        startBtn.style.display = this.currentStep === this.totalSteps ? 'inline-block' : 'none';

        // ステップに応じたハイライト
        this.highlightElement();
    }

    highlightElement() {
        const highlight = document.getElementById('guide-highlight');
        let targetElement = null;

        switch (this.currentStep) {
            case 1:
                targetElement = document.querySelector('.orders');
                break;
            case 2:
                targetElement = document.querySelector('.materials');
                break;
            case 3:
                targetElement = document.querySelector('.workshop');
                break;
            case 4:
                targetElement = document.querySelector('.music-game');
                break;
            case 5:
                targetElement = document.querySelector('.stats');
                break;
        }

        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            highlight.style.top = (rect.top + window.scrollY - 5) + 'px';
            highlight.style.left = (rect.left - 5) + 'px';
            highlight.style.width = (rect.width + 10) + 'px';
            highlight.style.height = (rect.height + 10) + 'px';
            highlight.classList.add('show');
        } else {
            highlight.classList.remove('show');
        }
    }

    startTutorialGame() {
        this.hideTutorial();
        document.getElementById('guide-highlight').classList.remove('show');
    }
}

// TrumpetShopGameクラスにチュートリアル機能を追加
TrumpetShopGame.prototype.showTutorial = function () {
    if (!this.tutorialManager) {
        this.tutorialManager = new TutorialManager();
    }
    this.tutorialManager.showTutorial();
};

TrumpetShopGame.prototype.hideTutorial = function () {
    if (this.tutorialManager) {
        this.tutorialManager.hideTutorial();
    }
};

TrumpetShopGame.prototype.nextTutorialStep = function () {
    if (this.tutorialManager) {
        this.tutorialManager.nextTutorialStep();
    }
};

TrumpetShopGame.prototype.prevTutorialStep = function () {
    if (this.tutorialManager) {
        this.tutorialManager.prevTutorialStep();
    }
};

TrumpetShopGame.prototype.startTutorialGame = function () {
    if (this.tutorialManager) {
        this.tutorialManager.startTutorialGame();
    }
};

// ゲーム開始
window.addEventListener('DOMContentLoaded', () => {
    new TrumpetShopGame();
});
