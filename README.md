# Chat Backend Service

## 개요

이 프로젝트는 NestJS 프레임워크와 RabbitMQ를 활용한 실시간 채팅 백엔드 서비스입니다. WebSocket을 통해 클라이언트와 실시간 통신을 하며, RabbitMQ를 메시지 브로커로 활용하여 1:1 개인 채팅과 다중 사용자 그룹 채팅을 모두 지원합니다. MongoDB를 데이터베이스로 사용하여 메시지와 사용자 정보를 저장하고 메세지 내역은 저장하지 않습니다.

## 주요 기능

- WebSocket 기반 실시간 1:1, 1:n 개인 및 단체 채팅
- 그룹 채팅방 생성 및 관리
- 메시지 읽음 확인 기능
- RabbitMQ를 활용한 메시지 큐 아키텍처
- MongoDB에 채팅방 정보 영구 저장
- 확장 가능한 마이크로서비스 구조

## 기술 스택

- **Backend Framework**: NestJS
- **실시간 통신**: Socket.IO (WebSocket)
- **Message Broker**: RabbitMQ
- **Database**: MongoDB
- **Authentication**: WsAuthGuard를 통한 WebSocket 인증

## 아키텍처

1. **WebSocket Gateway**: 클라이언트와의 실시간 양방향 통신을 관리합니다.
2. **NestJS 백엔드 서버**: 비즈니스 로직 및 데이터 관리를 처리합니다.
3. **RabbitMQ 메시지 브로커**: 채팅 메시지와 읽음 확인을 큐에 저장하고 배포합니다.
4. **메시지 소비자 서비스**: 큐에서 메시지를 가져와 적절한 수신자에게 전달합니다.
5. **MongoDB 데이터베이스**: 사용자, 채팅방, 메시지 데이터를 영구 저장합니다.

```
클라이언트 <-> WebSocket Gateway <-> NestJS 서버 <-> RabbitMQ <-> 메시지 소비자 -> 수신자
                                        |
                                        v
                                    MongoDB
```

## 주요 컴포넌트

### WebSocket Gateway

`ChatGateway`

- **연결 처리**: 클라이언트 연결 시 사용자 정보를 확인하고 메시지 핸들러를 설정합니다.
- **메시지 전송**: `sendMessage` 이벤트를 통해 채팅 메시지를 RabbitMQ로 전송합니다.
- **읽음 확인**: `markAsRead` 이벤트를 통해 메시지 읽음 상태를 업데이트합니다.
- **채팅방 생성**: `createRoom` 이벤트로 1:1 또는 그룹 채팅방을 생성합니다.
- **연결 해제**: 클라이언트 연결 종료 시 자원을 정리하고 사용자 상태를 업데이트합니다.

### RabbitMQ

`RabbitMQService`

- 채팅 메시지 큐 관리
- 읽음 상태 큐 관리
- 메시지 소비자 설정 및 취소
- 사용자별 메시지 라우팅

### MongoDB

`MongoDB`

- **Users**: 사용자 정보 및 연결 상태
- **Rooms**: 채팅방 정보 및 참여자
- **Messages**: 채팅 메시지 및 읽음 상태

## 설치 방법

### 설치 단계

1. 저장소 클론

   ```bash
   git clone https://github.com/Dokbawi/chat.git
   cd chat
   ```

2. 의존성 설치

   ```bash
   npm install
   ```

3. 환경 변수 설정

   ```bash
   .env
   ```

4. 주요 환경 변수

   ```
   # .env
   RABBITMQ_URL=amqp://username:password@localhost:5672  # RabbitMQ 연결 정보
   MONGODB_URI=mongodb://localhost:27017/chatdb  # MongoDB 연결 정보
   ```

5. 서버 실행
   ```bash
   npm run start:dev
   ```
